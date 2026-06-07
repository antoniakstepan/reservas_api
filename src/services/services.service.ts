import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateServiceDto) {
    const company = await this.getCompanyByOwnerId(userId);

    return this.prisma.service.create({
      data: {
        companyId: company.id,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        durationMinutes: dto.durationMinutes,
        category: dto.category,
      },
    });
  }

  async findMyCompanyServices(userId: string) {
    const company = await this.getCompanyByOwnerId(userId);

    return this.prisma.service.findMany({
      where: {
        companyId: company.id,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(userId: string, serviceId: string, dto: UpdateServiceDto) {
    const company = await this.getCompanyByOwnerId(userId);

    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        companyId: company.id,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.prisma.service.update({
      where: {
        id: service.id,
      },
      data: dto,
    });
  }

  async remove(userId: string, serviceId: string) {
    const company = await this.getCompanyByOwnerId(userId);

    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        companyId: company.id,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return this.prisma.service.update({
      where: {
        id: service.id,
      },
      data: {
        isActive: false,
      },
    });
  }

  private async getCompanyByOwnerId(userId: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        ownerId: userId,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }
}
