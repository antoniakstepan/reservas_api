import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CompanyClientsService } from 'src/company-clients/company-clients.service';
import { TimeUtil } from '../common/utils/time.util';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyClientsService: CompanyClientsService,
  ) {}

  private async ensureWorkerIsAvailable(
    workerProfileId: string,
    startDateTime: Date,
    endDateTime: Date,
  ) {
    const dayOfWeek = TimeUtil.getDayOfWeek(startDateTime);

    const availability = await this.prisma.workerAvailability.findFirst({
      where: {
        workerProfileId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!availability) {
      throw new BadRequestException('Worker is not available on this day');
    }

    const bookingStart = TimeUtil.getMinutesFromDate(startDateTime);
    const bookingEnd = TimeUtil.getMinutesFromDate(endDateTime);

    const availabilityStart = TimeUtil.timeToMinutes(availability.startTime);
    const availabilityEnd = TimeUtil.timeToMinutes(availability.endTime);

    if (bookingStart < availabilityStart || bookingEnd > availabilityEnd) {
      throw new BadRequestException(
        'Booking time is outside worker availability',
      );
    }
  }

  async create(user: { id: string; role: UserRole }, dto: CreateBookingDto) {
    if (user.role !== UserRole.COMPANY_OWNER && user.role !== UserRole.WORKER) {
      throw new ForbiddenException(
        'Only company or worker can create bookings',
      );
    }

    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.ensureCanManageBooking(user.id, user.role, company.id);

    const worker = await this.prisma.workerProfile.findFirst({
      where: {
        id: dto.workerProfileId,
        companyId: dto.companyId,
        isActive: true,
      },
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    const service = await this.prisma.service.findFirst({
      where: {
        id: dto.serviceId,
        companyId: dto.companyId,
        isActive: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    const companyClient = await this.companyClientsService.resolveForBooking(
      dto.companyId,
      dto,
    );

    const startDateTime = new Date(dto.startDateTime);

    const endDateTime = dto.endDateTime
      ? new Date(dto.endDateTime)
      : new Date(startDateTime.getTime() + service.durationMinutes * 60 * 1000);

    if (endDateTime <= startDateTime) {
      throw new BadRequestException('endDateTime must be after startDateTime');
    }

    await this.ensureWorkerIsAvailable(
      dto.workerProfileId,
      startDateTime,
      endDateTime,
    );

    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        workerProfileId: dto.workerProfileId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
        startDateTime: {
          lt: endDateTime,
        },
        endDateTime: {
          gt: startDateTime,
        },
      },
    });

    if (conflictingBooking) {
      throw new ConflictException('Worker already has a booking at this time');
    }

    return this.prisma.booking.create({
      data: {
        companyId: dto.companyId,
        companyClientId: companyClient.id,
        clientId: companyClient.userId,
        workerProfileId: dto.workerProfileId,
        serviceId: dto.serviceId,
        startDateTime,
        endDateTime,
        clientNote: dto.clientNote,
        status: BookingStatus.CONFIRMED,
      },
    });
  }
  async findAll(clientId: string) {
    return this.prisma.booking.findMany({
      where: { clientId },
      include: {
        company: true,
        workerProfile: true,
        service: true,
      },
      orderBy: {
        startDateTime: 'desc',
      },
    });
  }

  async findOne(clientId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        company: true,
        workerProfile: true,
        service: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.clientId !== clientId) {
      throw new ForbiddenException('You cannot access this booking');
    }

    return booking;
  }

  async update(
    user: { id: string; role: UserRole },
    id: string,
    dto: UpdateBookingDto,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (user.role === UserRole.CLIENT && booking.clientId !== user.id) {
      throw new ForbiddenException('You cannot update this booking');
    }

    if (user.role !== UserRole.CLIENT) {
      await this.ensureCanManageBooking(user.id, user.role, booking.companyId);
    }

    if (user.role === UserRole.CLIENT && dto.endDateTime) {
      throw new ForbiddenException('Client cannot change booking end time');
    }

    const startDateTime = dto.startDateTime
      ? new Date(dto.startDateTime)
      : booking.startDateTime;

    let endDateTime = booking.endDateTime;

    if (user.role !== UserRole.CLIENT && dto.endDateTime) {
      endDateTime = new Date(dto.endDateTime);
    } else if (dto.startDateTime || dto.serviceId) {
      const serviceId = dto.serviceId ?? booking.serviceId;

      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      endDateTime = new Date(
        startDateTime.getTime() + service.durationMinutes * 60 * 1000,
      );
    }

    if (endDateTime <= startDateTime) {
      throw new BadRequestException('endDateTime must be after startDateTime');
    }

    await this.ensureWorkerIsAvailable(
      dto.workerProfileId ?? booking.workerProfileId,
      startDateTime,
      endDateTime,
    );

    const workerProfileId = dto.workerProfileId ?? booking.workerProfileId;

    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        id: {
          not: id,
        },
        workerProfileId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
        startDateTime: {
          lt: endDateTime,
        },
        endDateTime: {
          gt: startDateTime,
        },
      },
    });

    if (conflictingBooking) {
      throw new ConflictException('Worker already has a booking at this time');
    }

    let companyClientId = booking.companyClientId;
    let clientId = booking.clientId;

    if (dto.companyClientId) {
      if (user.role === UserRole.CLIENT) {
        throw new ForbiddenException('Client cannot change company client');
      }

      const companyClient = await this.prisma.companyClient.findFirst({
        where: {
          id: dto.companyClientId,
          companyId: booking.companyId,
        },
      });

      if (!companyClient) {
        throw new NotFoundException('Company client not found');
      }

      companyClientId = companyClient.id;
      clientId = companyClient.userId;
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        companyClientId,
        clientId,
        workerProfileId: dto.workerProfileId,
        serviceId: dto.serviceId,
        startDateTime,
        endDateTime,
        status: dto.status,
        clientNote: dto.clientNote,
        cancelReason: dto.cancelReason,
      },
    });
  }

  async remove(clientId: string, id: string) {
    await this.findOne(clientId, id);

    return this.prisma.booking.delete({
      where: { id },
    });
  }

  private async ensureCanManageBooking(
    userId: string,
    role: UserRole,
    companyId: string,
  ) {
    if (role === UserRole.COMPANY_OWNER) {
      const company = await this.prisma.company.findFirst({
        where: {
          id: companyId,
          ownerId: userId,
        },
      });

      if (!company) {
        throw new ForbiddenException('You cannot manage this booking');
      }

      return;
    }

    if (role === UserRole.WORKER) {
      const worker = await this.prisma.workerProfile.findFirst({
        where: {
          userId,
          companyId,
          isActive: true,
        },
      });

      if (!worker) {
        throw new ForbiddenException('You cannot manage this booking');
      }

      return;
    }

    throw new ForbiddenException('You cannot manage this booking');
  }

  async approve(userId: string, role: UserRole, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    await this.ensureCanManageBooking(userId, role, booking.companyId);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be approved');
    }

    return this.prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: BookingStatus.CONFIRMED,
      },
    });
  }

  async decline(userId: string, role: UserRole, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    await this.ensureCanManageBooking(userId, role, booking.companyId);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be declined');
    }

    return this.prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: BookingStatus.DECLINED,
      },
    });
  }
}
