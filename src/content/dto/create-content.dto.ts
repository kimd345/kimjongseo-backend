// src/content/dto/create-content.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';
import { ContentType, PublishStatus } from '../../entities/content.entity';

export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(ContentType)
  @IsOptional()
  type?: ContentType = ContentType.ARTICLE;

  @IsEnum(PublishStatus)
  @IsOptional()
  status?: PublishStatus = PublishStatus.DRAFT;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];

  @IsString()
  @IsOptional()
  youtubeId?: string;

  @IsArray()
  @IsOptional()
  youtubeUrls?: string[];

  @IsOptional()
  metadata?: any;

  @IsNumber()
  @IsOptional()
  sortOrder?: number = 1;

  @IsNumber()
  @IsOptional()
  menuId?: number;

  @IsString()
  @IsOptional()
  authorName?: string;
}
