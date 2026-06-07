import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { TimeUtil } from '../common/utils/time.util';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  private validateTimeRange(startTime: string, endTime: string) {
    const start = TimeUtil.timeToMinutes(startTime);
    const end = TimeUtil.timeToMinutes(endTime);

    if (start >= end) {
      throw new BadRequestException('startTime must be before endTime');
    }
  }

  async create(userId: string, dto: CreateAvailabilityDto) {
    this.validateTimeRange(dto.startTime, dto.endTime);
    const workerProfile = await this.prisma.workerProfile.findUnique({
      where: {
        id: dto.workerProfileId,
      },
    });

    if (!workerProfile) {
      throw new NotFoundException('Worker profile not found');
    }

    const existingAvailability = await this.prisma.workerAvailability.findFirst(
      {
        where: {
          workerProfileId: dto.workerProfileId,
          dayOfWeek: dto.dayOfWeek,
          isActive: true,
        },
      },
    );
    if (existingAvailability) {
      throw new BadRequestException('Availability for this day already exists');
    }

    const canManageAsOwner = await this.prisma.company.findFirst({
      where: {
        id: workerProfile.companyId,
        ownerId: userId,
      },
    });

    const canManageAsWorker = workerProfile.userId === userId;

    if (!canManageAsOwner && !canManageAsWorker) {
      throw new ForbiddenException(
        'You cannot manage this worker availability',
      );
    }

    return this.prisma.workerAvailability.create({
      data: {
        workerProfileId: dto.workerProfileId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findByWorker(workerProfileId: string) {
    return this.prisma.workerAvailability.findMany({
      where: {
        workerProfileId,
        isActive: true,
      },
      orderBy: {
        dayOfWeek: 'asc',
      },
    });
  }

  async remove(userId: string, id: string) {
    const availability = await this.prisma.workerAvailability.findFirst({
      where: {
        id,
        workerProfile: {
          company: {
            ownerId: userId,
          },
        },
      },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    return this.prisma.workerAvailability.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  }
}
