import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { CompanyMembersModule } from './company-members/company-members.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ServicesModule } from './services/services.module';
import { WorkersModule } from './workers/workers.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingsModule } from './bookings/bookings.module';
import { ClientsModule } from './clients/clients.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CompanyClientsModule } from './company-clients/company-clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    CompanyMembersModule,
    SubscriptionsModule,
    ServicesModule,
    WorkersModule,
    AvailabilityModule,
    BookingsModule,
    ClientsModule,
    AnalyticsModule,
    CompanyClientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
