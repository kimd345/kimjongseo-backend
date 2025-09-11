import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentType, PublishStatus } from '../entities/content.entity';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createContentDto: CreateContentDto) {
    return this.contentService.create(createContentDto);
  }

  @Get()
  findAll(
    @Query('type') type?: ContentType,
    @Query('status') status?: PublishStatus,
    @Query('menuId') menuId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // Convert string parameters to numbers with defaults
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const menuIdNum = menuId ? parseInt(menuId, 10) : undefined;

    return this.contentService.findAll({
      type,
      status,
      menuId: menuIdNum,
      page: pageNum,
      limit: limitNum,
    });
  }

  @Get('by-menu/:menuUrl')
  findByMenu(@Param('menuUrl') menuUrl: string) {
    return this.contentService.findBySlug(menuUrl);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.findOne(id);
  }

  @Get(':id/view')
  async incrementView(@Param('id', ParseIntPipe) id: number) {
    await this.contentService.incrementViewCount(id);
    return this.contentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContentDto: UpdateContentDto,
  ) {
    return this.contentService.update(id, updateContentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contentService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('sort-order')
  updateSortOrder(@Body() sortData: { id: number; sortOrder: number }[]) {
    return this.contentService.updateSortOrder(sortData);
  }
}
