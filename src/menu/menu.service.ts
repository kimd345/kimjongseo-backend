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

    // Validate parent exists if parentId is provided and not null
    if (
      updateMenuDto.parentId !== null &&
      updateMenuDto.parentId !== undefined
    ) {
      const parent = await this.menuRepository.findOne({
        where: { id: updateMenuDto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('Parent menu not found');
      }
    }

    // Explicitly handle parentId - if it's null/undefined, set to null in database
    const updateData = {
      ...updateMenuDto,
      parentId: updateMenuDto.parentId || null, // Ensure null for top-level
    };

    await this.menuRepository.update(id, updateData);
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

  async updateMenuOrder(
    reorderData: { id: number; sortOrder: number; parentId?: number }[],
  ): Promise<void> {
    // Use transaction to ensure data consistency
    await this.menuRepository.manager.transaction(async (manager) => {
      const updatePromises = reorderData.map(({ id, sortOrder, parentId }) =>
        manager.update(Menu, id, {
          sortOrder,
          parentId: parentId || null,
        }),
      );
      await Promise.all(updatePromises);
    });
  }

  async findByPath(path: string): Promise<Menu> {
    const pathSegments = path.split('/').filter(Boolean);

    if (pathSegments.length === 1) {
      // Single level path
      return this.findByUrl(pathSegments[0]);
    }

    // Multi-level path - find by traversing hierarchy
    let currentMenu: Menu | null = null;

    for (const segment of pathSegments) {
      if (!currentMenu) {
        // Find root level menu
        currentMenu = await this.menuRepository.findOne({
          where: { url: segment, parentId: null },
          relations: ['children'],
        });
      } else {
        // Find child menu
        currentMenu =
          currentMenu.children?.find((child) => child.url === segment) || null;
      }

      if (!currentMenu) {
        throw new NotFoundException(`Menu path "${path}" not found`);
      }
    }

    return currentMenu;
  }

  async seedDefaultMenus(): Promise<void> {
    const existingMenus = await this.menuRepository.count();
    if (existingMenus > 0) return;

    const defaultMenus = [
      // Main sections
      {
        name: '절재 김종서 장군',
        url: 'about-general',
        description:
          '조선 전기 명재상이자 무장인 김종서 장군의 생애와 업적을 살펴봅니다.',
        sortOrder: 1,
        type: 'section',
      },
      {
        name: '기념사업회',
        url: 'organization',
        description:
          '김종서 장군을 기리는 기념사업회의 설립목적과 주요 활동을 소개합니다.',
        sortOrder: 2,
        type: 'section',
      },
      {
        name: '자료실',
        url: 'library',
        description:
          '김종서 장군과 관련된 학술자료, 보도자료, 사진 등을 제공합니다.',
        sortOrder: 3,
        type: 'section',
      },
      {
        name: '연락처 & 오시는 길',
        url: 'contact',
        description: '기념사업회 사무국 연락처와 찾아오시는 방법을 안내합니다.',
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
        description:
          '김종서 장군의 출생부터 역사적 업적까지 상세한 생애를 소개합니다.',
        parentId: createdMenus[0].id,
        sortOrder: 1,
      },
      {
        name: '역사적 의의',
        url: 'significance',
        description:
          '조선 전기 정치사에서 김종서 장군이 가지는 특별한 의미를 분석합니다.',
        parentId: createdMenus[0].id,
        sortOrder: 2,
      },
      {
        name: '관련 사료 및 연구',
        url: 'sources',
        description:
          '김종서 장군과 관련된 역사 사료와 최신 연구 성과를 모았습니다.',
        parentId: createdMenus[0].id,
        sortOrder: 3,
      },
      {
        name: '사진·영상 자료',
        url: 'photos',
        description:
          '김종서 장군 관련 유적지, 문화재 등의 사진과 영상 자료입니다.',
        parentId: createdMenus[0].id,
        sortOrder: 4,
      },
    ];

    // Sub-menus for 기념사업회
    const orgSubMenus = [
      {
        name: '사업회 소개',
        url: 'overview',
        description:
          '김종서장군기념사업회의 설립 목적과 주요 사업을 소개합니다.',
        parentId: createdMenus[1].id,
        sortOrder: 1,
      },
      {
        name: '회장 인사말',
        url: 'chairman',
        description:
          '김종서장군기념사업회 회장의 인사말과 비전을 전해드립니다.',
        parentId: createdMenus[1].id,
        sortOrder: 2,
      },
      {
        name: '연혁',
        url: 'history',
        description:
          '기념사업회의 설립부터 현재까지의 주요 연혁을 정리했습니다.',
        parentId: createdMenus[1].id,
        sortOrder: 3,
      },
      {
        name: '선양사업',
        url: 'projects',
        description:
          '김종서 장군의 정신을 기리는 다양한 선양사업을 소개합니다.',
        parentId: createdMenus[1].id,
        sortOrder: 4,
      },
      {
        name: '공지사항',
        url: 'announcements',
        description: '기념사업회의 최신 소식과 중요한 공지사항을 확인하세요.',
        parentId: createdMenus[1].id,
        sortOrder: 5,
      },
    ];

    // Sub-menus for 자료실
    const librarySubMenus = [
      {
        name: '보도자료',
        url: 'press',
        description: '기념사업회 활동과 관련된 언론 보도자료를 모았습니다.',
        parentId: createdMenus[2].id,
        sortOrder: 1,
      },
      {
        name: '학술 자료·연구 보고서',
        url: 'academic',
        description: '김종서 장군 관련 학술 논문과 연구 보고서를 제공합니다.',
        parentId: createdMenus[2].id,
        sortOrder: 2,
      },
      {
        name: '사진·영상 아카이브',
        url: 'archive',
        description:
          '역사적 가치가 있는 사진과 영상 자료를 체계적으로 보관합니다.',
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

    console.log('Default menu structure with descriptions created');
  }
}
