import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyCompany(userId: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        ownerId: userId,
      },

      include: {
        subscription: true,

        members: {
          include: {
            user: true,
          },
        },

        services: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async updateMyCompany(userId: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findFirst({
      where: {
        ownerId: userId,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.company.update({
      where: {
        id: company.id,
      },
      data: dto,
    });
  }
}
