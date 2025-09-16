// src/menu/menu.controller.ts - Updated with path support
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @Get('tree')
  findTree() {
    return this.menuService.findTree();
  }

  @Get('by-url/:url')
  findByUrl(@Param('url') url: string) {
    return this.menuService.findByUrl(url);
  }

  // NEW: Get menu by path (supports nested paths like "about/history")
  @Get('by-path/:path(*)')
  findByPath(@Param('path') path: string) {
    return this.menuService.findByPath(path);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menuService.update(id, updateMenuDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('sort-order')
  updateSortOrder(@Body() sortData: { id: number; sortOrder: number }[]) {
    return this.menuService.updateSortOrder(sortData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('seed')
  seedDefaultMenus() {
    return this.menuService.seedDefaultMenus();
  }
}
