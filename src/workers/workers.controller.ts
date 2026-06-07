import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/сurrent-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { InviteWorkerDto } from './dto/invite-worker.dto';
import { WorkersService } from './workers.service';
import { AcceptWorkerInviteDto } from './dto/accept-worker-invite.dto';

@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  inviteWorker(
    @CurrentUser() user: { id: string },
    @Body() dto: InviteWorkerDto,
  ) {
    return this.workersService.inviteWorker(user.id, dto);
  }

  @Post('accept-invite')
  acceptInvite(@Body() dto: AcceptWorkerInviteDto) {
    return this.workersService.acceptInvite(dto);
  }
}
