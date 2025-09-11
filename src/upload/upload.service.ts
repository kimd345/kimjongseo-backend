// src/upload/upload.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload } from '../entities/file-upload.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(FileUpload)
    private fileUploadRepository: Repository<FileUpload>,
  ) {}

  async saveFileRecord(
    file: Express.Multer.File,
    contentId?: number,
    category: string = 'general',
  ): Promise<FileUpload> {
    const fileRecord = this.fileUploadRepository.create({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      contentId,
      category: this.categorizeFile(file.mimetype),
    });

    return this.fileUploadRepository.save(fileRecord);
  }

  async findAll(category?: string): Promise<FileUpload[]> {
    const where = category ? { category } : {};
    return this.fileUploadRepository.find({
      where,
      order: { uploadedAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<FileUpload> {
    const file = await this.fileUploadRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  async findByContentId(contentId: number): Promise<FileUpload[]> {
    return this.fileUploadRepository.find({
      where: { contentId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async remove(id: number): Promise<void> {
    const file = await this.findOne(id);

    // Delete physical file
    try {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    // Delete database record
    await this.fileUploadRepository.remove(file);
  }

  private categorizeFile(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('sheet')
    ) {
      return 'document';
    }
    return 'general';
  }

  async getFileStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    categories: { [key: string]: number };
  }> {
    const files = await this.fileUploadRepository.find();
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);

    const categories = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {});

    return { totalFiles, totalSize, categories };
  }
}
