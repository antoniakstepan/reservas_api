import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/сurrent-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.create(user.id, dto);
  }

  @Get('worker/:workerProfileId')
  findByWorker(@Param('workerProfileId') workerProfileId: string) {
    return this.availabilityService.findByWorker(workerProfileId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.availabilityService.remove(user.id, id);
  }
}
