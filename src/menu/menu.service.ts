// src/menu/menu.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    // Validate parent exists if parentId is provided
    if (createMenuDto.parentId) {
      const parent = await this.menuRepository.findOne({
        where: { id: createMenuDto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('Parent menu not found');
      }
    }

    const menu = this.menuRepository.create(createMenuDto);
    return this.menuRepository.save(menu);
  }

  async findAll(): Promise<Menu[]> {
    return this.menuRepository.find({
      relations: ['parent', 'children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findTree(): Promise<Menu[]> {
    const allMenus = await this.findAll();

    // Build hierarchical tree structure
    const menuMap = new Map<number, Menu>();
    const rootMenus: Menu[] = [];

    // First pass: create map
    allMenus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // Second pass: build tree
    allMenus.forEach((menu) => {
      const menuItem = menuMap.get(menu.id);
      if (menu.parentId && menuMap.has(menu.parentId)) {
        const parent = menuMap.get(menu.parentId);
        parent.children.push(menuItem);
      } else {
        rootMenus.push(menuItem);
      }
    });

    return rootMenus.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu;
  }

  async findByUrl(url: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { url },
      relations: ['parent', 'children'],
    });

    if (!menu) {
      throw new NotFoundException(`Menu with URL ${url} not found`);
    }

    return menu;
  }

  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    // Prevent circular references
    if (updateMenuDto.parentId === id) {
      throw new BadRequestException('Menu cannot be its own parent');
    }

    if (updateMenuDto.parentId) {
      const parent = await this.menuRepository.findOne({
        where: { id: updateMenuDto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('Parent menu not found');
      }
    }

    await this.menuRepository.update(id, updateMenuDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);

    // Check if menu has children
    const children = await this.menuRepository.find({
      where: { parentId: id },
    });

    if (children.length > 0) {
      throw new BadRequestException('Cannot delete menu with child items');
    }

    await this.menuRepository.remove(menu);
  }

  async updateSortOrder(
    menuUpdates: { id: number; sortOrder: number }[],
  ): Promise<void> {
    const updatePromises = menuUpdates.map(({ id, sortOrder }) =>
      this.menuRepository.update(id, { sortOrder }),
    );
    await Promise.all(updatePromises);
  }

  async seedDefaultMenus(): Promise<void> {
    const existingMenus = await this.menuRepository.count();
    if (existingMenus > 0) return;

    const defaultMenus = [
      // Main sections
      {
        name: '절재 김종서 장군',
        url: 'about-general',
        sortOrder: 1,
        type: 'section',
      },
      {
        name: '기념사업회',
        url: 'organization',
        sortOrder: 2,
        type: 'section',
      },
      { name: '자료실', url: 'library', sortOrder: 3, type: 'section' },
      {
        name: '연락처 & 오시는 길',
        url: 'contact',
        sortOrder: 4,
        type: 'page',
      },
    ];

    const createdMenus = await Promise.all(
      defaultMenus.map((menu) =>
        this.menuRepository.save(this.menuRepository.create(menu)),
      ),
    );

    // Sub-menus for 절재 김종서 장군
    const generalSubMenus = [
      {
        name: '생애 및 업적',
        url: 'life',
        parentId: createdMenus[0].id,
        sortOrder: 1,
      },
      {
        name: '역사적 의의',
        url: 'significance',
        parentId: createdMenus[0].id,
        sortOrder: 2,
      },
      {
        name: '관련 사료 및 연구',
        url: 'sources',
        parentId: createdMenus[0].id,
        sortOrder: 3,
      },
      {
        name: '사진·영상 자료',
        url: 'photos',
        parentId: createdMenus[0].id,
        sortOrder: 4,
      },
    ];

    // Sub-menus for 기념사업회
    const orgSubMenus = [
      {
        name: '사업회 소개',
        url: 'overview',
        parentId: createdMenus[1].id,
        sortOrder: 1,
      },
      {
        name: '회장 인사말',
        url: 'chairman',
        parentId: createdMenus[1].id,
        sortOrder: 2,
      },
      {
        name: '연혁',
        url: 'history',
        parentId: createdMenus[1].id,
        sortOrder: 3,
      },
      {
        name: '선양사업',
        url: 'projects',
        parentId: createdMenus[1].id,
        sortOrder: 4,
      },
      {
        name: '공지사항',
        url: 'announcements',
        parentId: createdMenus[1].id,
        sortOrder: 5,
      },
    ];

    // Sub-menus for 자료실
    const librarySubMenus = [
      {
        name: '보도자료',
        url: 'press',
        parentId: createdMenus[2].id,
        sortOrder: 1,
      },
      {
        name: '학술 자료·연구 보고서',
        url: 'academic',
        parentId: createdMenus[2].id,
        sortOrder: 2,
      },
      {
        name: '사진·영상 아카이브',
        url: 'archive',
        parentId: createdMenus[2].id,
        sortOrder: 3,
      },
    ];

    await Promise.all([
      ...generalSubMenus.map((menu) =>
        this.menuRepository.save(this.menuRepository.create(menu)),
      ),
      ...orgSubMenus.map((menu) =>
        this.menuRepository.save(this.menuRepository.create(menu)),
      ),
      ...librarySubMenus.map((menu) =>
        this.menuRepository.save(this.menuRepository.create(menu)),
      ),
    ]);

    console.log('Default menu structure created');
  }
}
