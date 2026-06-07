import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanyClientDto } from './dto/create-company-client.dto';

@Injectable()
export class CompanyClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCompanyClientDto) {
    const company = await this.prisma.company.findFirst({
      where: {
        ownerId: userId,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (!dto.userId && !dto.firstName && !dto.phone) {
      throw new BadRequestException(
        'Client userId or guest client information is required',
      );
    }

    return this.prisma.companyClient.create({
      data: {
        companyId: company.id,
        userId: dto.userId,
        firstName: dto.firstName ?? 'Client',
        lastName: dto.lastName,
        middleName: dto.middleName,
        phone: dto.phone,
        email: dto.email,
        isGuest: !dto.userId,
      },
    });
  }

  async findAll(userId: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        ownerId: userId,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.companyClient.findMany({
      where: {
        companyId: company.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async resolveForBooking(
    companyId: string,
    dto: {
      companyClientId?: string;
      clientFirstName?: string;
      clientLastName?: string;
      clientMiddleName?: string;
      clientPhone?: string;
      clientEmail?: string;
    },
  ) {
    if (dto.companyClientId) {
      const companyClient = await this.prisma.companyClient.findFirst({
        where: {
          id: dto.companyClientId,
          companyId,
        },
      });

      if (!companyClient) {
        throw new NotFoundException('Company client not found');
      }

      return companyClient;
    }

    if (!dto.clientFirstName || !dto.clientPhone) {
      throw new BadRequestException(
        'clientFirstName and clientPhone are required',
      );
    }

    let companyClient = await this.prisma.companyClient.findFirst({
      where: {
        companyId,
        phone: dto.clientPhone,
      },
    });

    if (!companyClient) {
      companyClient = await this.prisma.companyClient.create({
        data: {
          companyId,
          firstName: dto.clientFirstName,
          lastName: dto.clientLastName,
          middleName: dto.clientMiddleName,
          phone: dto.clientPhone,
          email: dto.clientEmail,
        },
      });
    }

    return companyClient;
  }
}
