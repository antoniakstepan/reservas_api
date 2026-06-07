import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  workerProfileId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ format: 'date-time', example: '2026-06-01T10:00:00.000Z' })
  @IsDateString()
  startDateTime: string;

  @ApiPropertyOptional({
    format: 'date-time',
    example: '2026-06-01T11:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDateTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientNote?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  companyClientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientFirstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientLastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientMiddleName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  clientEmail?: string;
}
