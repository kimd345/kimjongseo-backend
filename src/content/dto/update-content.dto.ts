// src/content/dto/update-content.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateContentDto } from './create-content.dto';
import { IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContentDto extends PartialType(CreateContentDto) {
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  publishedAt?: Date;
}