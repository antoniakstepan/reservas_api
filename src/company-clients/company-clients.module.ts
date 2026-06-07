import { Module } from '@nestjs/common';
import { CompanyClientsController } from './company-clients.controller';
import { CompanyClientsService } from './company-clients.service';

@Module({
  controllers: [CompanyClientsController],
  providers: [CompanyClientsService],
  exports: [CompanyClientsService],
})
export class CompanyClientsModule {}
