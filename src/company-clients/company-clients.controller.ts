import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CompanyClientsService } from './company-clients.service';
import { CreateCompanyClientDto } from './dto/create-company-client.dto';
import type { AuthenticatedUser } from 'src/auth/types/authenticated-request.type';
import { CurrentUser } from 'src/auth/decorators/сurrent-user.decorator';
@Controller('company-clients')
@UseGuards(JwtAuthGuard)
export class CompanyClientsController {
  constructor(private readonly companyClientsService: CompanyClientsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCompanyClientDto,
  ) {
    return this.companyClientsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.companyClientsService.findAll(user.id);
  }
}
