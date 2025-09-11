// src/menu/dto/create-menu.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number = 1;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @IsString()
  @IsOptional()
  type?: string = 'page';

  @IsString()
  @IsOptional()
  iconImage?: string;

  @IsString()
  @IsOptional()
  cssClass?: string;
}
