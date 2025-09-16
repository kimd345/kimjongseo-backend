// src/content/content.service.ts - Updated with menu path support
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Content,
  ContentType,
  PublishStatus,
} from '../entities/content.entity';
import { Menu } from '../entities/menu.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    const content = this.contentRepository.create({
      ...createContentDto,
      publishedAt:
        createContentDto.status === PublishStatus.PUBLISHED ? new Date() : null,
    });
    return this.contentRepository.save(content);
  }

  async findAll(options?: {
    type?: ContentType;
    status?: PublishStatus;
    menuId?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: Content[]; total: number; page: number; limit: number }> {
    const { type, status, menuId, page = 1, limit = 10 } = options || {};

    const queryBuilder = this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.menu', 'menu')
      .orderBy('content.sortOrder', 'ASC')
      .addOrderBy('content.createdAt', 'DESC');

    if (type) {
      queryBuilder.andWhere('content.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('content.status = :status', { status });
    }

    if (menuId) {
      queryBuilder.andWhere('content.menuId = :menuId', { menuId });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['menu'],
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    return content;
  }

  async findBySlug(menuUrl: string, contentId?: number): Promise<Content[]> {
    const queryBuilder = this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.menu', 'menu')
      .where('menu.url = :menuUrl', { menuUrl })
      .andWhere('content.status = :status', { status: PublishStatus.PUBLISHED })
      .orderBy('content.sortOrder', 'ASC')
      .addOrderBy('content.createdAt', 'DESC');

    if (contentId) {
      queryBuilder.andWhere('content.id = :contentId', { contentId });
    }

    return queryBuilder.getMany();
  }

  // NEW: Find content by menu path (supports nested menu structures)
  async findByMenuPath(path: string): Promise<Content[]> {
    const pathSegments = path.split('/').filter(Boolean);

    // Find the target menu by following the path
    let currentMenu: Menu | null = null;

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];

      if (i === 0) {
        // Find root menu
        currentMenu = await this.menuRepository.findOne({
          where: { url: segment, parentId: null },
          relations: ['children'],
        });
      } else {
        // Find child menu
        if (currentMenu && currentMenu.children) {
          currentMenu =
            currentMenu.children.find((child) => child.url === segment) || null;
        }
      }

      if (!currentMenu) {
        return []; // Path not found
      }
    }

    if (!currentMenu) {
      return [];
    }

    // Get all content for this menu and its children
    const menuIds = [currentMenu.id];

    // Add child menu IDs recursively
    const addChildMenuIds = (menu: Menu) => {
      if (menu.children) {
        menu.children.forEach((child) => {
          menuIds.push(child.id);
          addChildMenuIds(child);
        });
      }
    };

    // Load full menu with children to get all nested IDs
    const fullMenu = await this.menuRepository.findOne({
      where: { id: currentMenu.id },
      relations: ['children', 'children.children'], // Load nested children
    });

    if (fullMenu) {
      addChildMenuIds(fullMenu);
    }

    return this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.menu', 'menu')
      .where('content.menuId IN (:...menuIds)', { menuIds })
      .andWhere('content.status = :status', { status: PublishStatus.PUBLISHED })
      .orderBy('content.sortOrder', 'ASC')
      .addOrderBy('content.createdAt', 'DESC')
      .getMany();
  }

  async update(
    id: number,
    updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    const content = await this.findOne(id);

    // Update publishedAt when status changes to published
    if (
      updateContentDto.status === PublishStatus.PUBLISHED &&
      content.status !== PublishStatus.PUBLISHED
    ) {
      updateContentDto.publishedAt = new Date();
    }

    await this.contentRepository.update(id, updateContentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const content = await this.findOne(id);
    await this.contentRepository.remove(content);
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.contentRepository.increment({ id }, 'viewCount', 1);
  }

  async updateSortOrder(
    contents: { id: number; sortOrder: number }[],
  ): Promise<void> {
    const updatePromises = contents.map(({ id, sortOrder }) =>
      this.contentRepository.update(id, { sortOrder }),
    );
    await Promise.all(updatePromises);
  }
}
