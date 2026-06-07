import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Haircut' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Classic men haircut' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ minimum: 0, example: 25.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ minimum: 5, example: 60 })
  @IsInt()
  @Min(5)
  durationMinutes: number;

  @ApiPropertyOptional({ example: 'Hair' })
  @IsOptional()
  @IsString()
  category?: string;
}
