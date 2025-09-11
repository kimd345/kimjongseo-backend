// src/content/content.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { Content } from '../entities/content.entity';
import { Menu } from '../entities/menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Content, Menu])],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
