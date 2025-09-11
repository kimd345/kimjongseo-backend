// src/entities/file-upload.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('file_uploads')
export class FileUpload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column()
  fileSize: number;

  @Column({ nullable: true })
  contentId: number;

  @Column({ default: 'general' })
  category: string; // 'image', 'document', 'video', 'general'

  @CreateDateColumn()
  uploadedAt: Date;
}
