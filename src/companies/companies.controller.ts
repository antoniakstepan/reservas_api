import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/сurrent-user.decorator';

import { CompaniesService } from './companies.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyCompany(@CurrentUser() user: { id: string }) {
    return this.companiesService.getMyCompany(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMyCompany(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.updateMyCompany(user.id, dto);
  }
}
