import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { CompanyClientsModule } from 'src/company-clients/company-clients.module';

@Module({
  imports: [CompanyClientsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
