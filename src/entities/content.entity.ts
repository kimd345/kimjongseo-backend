// src/entities/content.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Menu } from './menu.entity';

export enum ContentType {
  ARTICLE = 'article',
  ANNOUNCEMENT = 'announcement',
  PRESS_RELEASE = 'press_release',
  ACADEMIC_MATERIAL = 'academic_material',
  VIDEO = 'video',
  PHOTO_GALLERY = 'photo_gallery',
}

export enum PublishStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  PRIVATE = 'private',
}

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: ContentType,
    default: ContentType.ARTICLE,
  })
  type: ContentType;

  @Column({
    type: 'enum',
    enum: PublishStatus,
    default: PublishStatus.DRAFT,
  })
  status: PublishStatus;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ nullable: true })
  youtubeId: string;

  @Column({ type: 'simple-array', nullable: true })
  youtubeUrls: string[];

  @Column({ type: 'json', nullable: true })
  metadata: any; // For flexible additional data

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 1 })
  sortOrder: number;

  @ManyToOne(() => Menu, { nullable: true })
  @JoinColumn({ name: 'menuId' })
  menu: Menu;

  @Column({ nullable: true })
  menuId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ nullable: true })
  authorName: string;
}
