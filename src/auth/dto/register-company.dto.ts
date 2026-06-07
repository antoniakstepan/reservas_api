import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { OrganizationType } from '../../generated/prisma/client';

export class RegisterCompanyDto {
  @ApiProperty({ example: 'owner@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+380501234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Beauty Studio' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ enum: OrganizationType, enumName: 'OrganizationType' })
  @IsEnum(OrganizationType)
  organizationType: OrganizationType;

  @ApiPropertyOptional({ example: 'Kyiv' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Ukraine' })
  @IsOptional()
  @IsString()
  country?: string;
}
