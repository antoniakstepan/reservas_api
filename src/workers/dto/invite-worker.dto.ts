import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class InviteWorkerDto {
  @ApiProperty({ example: 'worker@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'Stylist' })
  @IsOptional()
  @IsString()
  position?: string;
}
