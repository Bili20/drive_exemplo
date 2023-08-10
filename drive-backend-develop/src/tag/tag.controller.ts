import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TagDTO } from './dto/tag.dto';
import { UpdateTagDTO } from './dto/updateTag.dto';
import { TagService } from './tag.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Grupos } from 'src/auth/enum/grupo.enum';
import { IsPublic } from 'src/auth/decorators/isPublic';

@ApiTags('Tag')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @IsPublic()
  @Get()
  findAllTags() {
    return this.tagService.findAllTags();
  }

  @IsPublic()
  @Get('categoria')
  findAllCategoria() {
    return this.tagService.findAllCategoria();
  }

  @Post('create')
  async createTag(@Body() tagDTO: TagDTO) {
    try {
      await this.tagService.createTag(tagDTO);
      return true;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Roles(Grupos.MARKETING)
  @Patch(':id')
  async updateTag(@Param('id') id: number, @Body() tagDTO: UpdateTagDTO) {
    try {
      await this.tagService.updateTag(id, tagDTO);
      return true;
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @Roles(Grupos.MARKETING)
  @Delete('destroy/:id')
  destroyTag(@Param('id') id: number) {
    return this.tagService.destroyTag(id);
  }
}
