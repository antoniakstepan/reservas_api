import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  CompanyMemberRole,
  CompanyMemberStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
} from '../generated/prisma/client';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerClient(dto: RegisterClientDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: UserRole.CLIENT,

        clientProfile: {
          create: {},
        },
      },
    });

    return this.generateAuthResponse(user);
  }

  async registerCompany(dto: RegisterCompanyDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const slug = this.generateSlug(dto.companyName);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          role: UserRole.COMPANY_OWNER,
        },
      });

      await tx.company.create({
        data: {
          ownerId: createdUser.id,
          name: dto.companyName,
          slug,
          organizationType: dto.organizationType,
          city: dto.city,
          country: dto.country,

          subscription: {
            create: {
              plan: SubscriptionPlan.BASIC,
              status: SubscriptionStatus.TRIAL,
              maxWorkers: 5,
            },
          },

          members: {
            create: {
              userId: createdUser.id,
              role: CompanyMemberRole.OWNER,
              status: CompanyMemberStatus.ACTIVE,
              joinedAt: new Date(),
            },
          },
        },
      });

      return createdUser;
    });

    return this.generateAuthResponse(user);
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  private async generateAuthResponse(user: {
    id: string;
    email: string;
    role: UserRole;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,

      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  private generateSlug(companyName: string) {
    return (
      companyName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-') +
      '-' +
      Math.floor(Math.random() * 10000)
    );
  }
}
