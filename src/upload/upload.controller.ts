// src/upload/upload.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  ParseIntPipe,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as path from 'path';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Query('contentId') contentId?: number,
    @Query('category') category?: string,
  ) {
    return this.uploadService.saveFileRecord(file, contentId, category);
  }

  @UseGuards(JwtAuthGuard)
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('contentId') contentId?: number,
    @Query('category') category?: string,
  ) {
    const uploadPromises = files.map((file) =>
      this.uploadService.saveFileRecord(file, contentId, category),
    );
    return Promise.all(uploadPromises);
  }

  @Get()
  findAll(@Query('category') category?: string) {
    return this.uploadService.findAll(category);
  }

  @Get('stats')
  getStats() {
    return this.uploadService.getFileStats();
  }

  @Get('content/:contentId')
  findByContentId(@Param('contentId', ParseIntPipe) contentId: number) {
    return this.uploadService.findByContentId(contentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.uploadService.findOne(id);
  }

  @Get('serve/:id')
  async serveFile(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const fileRecord = await this.uploadService.findOne(id);

    if (!fs.existsSync(fileRecord.filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    res.setHeader('Content-Type', fileRecord.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${fileRecord.originalName}"`,
    );

    const fileStream = fs.createReadStream(fileRecord.filePath);
    fileStream.pipe(res);
  }

  @Get('download/:id')
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const fileRecord = await this.uploadService.findOne(id);

    if (!fs.existsSync(fileRecord.filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    res.setHeader('Content-Type', fileRecord.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileRecord.originalName}"`,
    );

    const fileStream = fs.createReadStream(fileRecord.filePath);
    fileStream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.uploadService.remove(id);
  }
}
