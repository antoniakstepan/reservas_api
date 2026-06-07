import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CompanyMemberRole,
  CompanyMemberStatus,
} from '../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { InviteWorkerDto } from './dto/invite-worker.dto';
import { AcceptWorkerInviteDto } from './dto/accept-worker-invite.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../generated/prisma/client';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async inviteWorker(ownerId: string, dto: InviteWorkerDto) {
    const company = await this.prisma.company.findFirst({
      where: {
        ownerId,
      },
      include: {
        subscription: true,
        members: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const activeWorkersCount = company.members.filter(
      (member) =>
        member.role === CompanyMemberRole.WORKER &&
        member.status !== CompanyMemberStatus.DISABLED,
    ).length;

    const maxWorkers = company.subscription?.maxWorkers ?? 5;

    if (activeWorkersCount >= maxWorkers) {
      throw new BadRequestException('Worker limit reached for current plan');
    }

    const existingInvite = await this.prisma.companyMember.findFirst({
      where: {
        companyId: company.id,
        invitedEmail: dto.email,
        status: CompanyMemberStatus.INVITED,
      },
    });

    if (existingInvite) {
      throw new BadRequestException('Worker already invited');
    }

    const inviteCode = crypto.randomUUID();

    return this.prisma.companyMember.create({
      data: {
        companyId: company.id,
        invitedEmail: dto.email,
        inviteCode,
        inviteExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        role: CompanyMemberRole.WORKER,
        status: CompanyMemberStatus.INVITED,
      },
    });
  }

  async acceptInvite(dto: AcceptWorkerInviteDto) {
    const invite = await this.prisma.companyMember.findFirst({
      where: {
        inviteCode: dto.inviteCode,
        invitedEmail: dto.email,
        status: CompanyMemberStatus.INVITED,
      },
    });

    if (!invite) {
      throw new BadRequestException('Invalid invite');
    }

    if (invite.inviteExpiresAt && invite.inviteExpiresAt < new Date()) {
      throw new BadRequestException('Invite expired');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: UserRole.WORKER,
        },
      });

      const member = await tx.companyMember.update({
        where: {
          id: invite.id,
        },
        data: {
          userId: user.id,
          status: CompanyMemberStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });

      const workerProfile = await tx.workerProfile.create({
        data: {
          userId: user.id,
          companyId: invite.companyId,
          position: dto.position,
          bio: dto.bio,
          experienceYears: dto.experienceYears,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        member,
        workerProfile,
      };
    });
  }
}
