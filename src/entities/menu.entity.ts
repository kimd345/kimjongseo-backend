// src/entities/menu.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 1 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => Menu, (menu) => menu.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];

  @Column({ default: 'page' })
  type: string; // 'page', 'section', 'external'

  @Column({ nullable: true })
  iconImage: string;

  @Column({ nullable: true })
  cssClass: string;
}
