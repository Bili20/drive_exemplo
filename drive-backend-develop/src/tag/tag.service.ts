import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagDTO } from './dto/tag.dto';
import { UpdateTagDTO } from './dto/updateTag.dto';
import { TagEntity } from './entities/tag.entity';
import { AnexoEntity } from 'src/anexo/entities/anexo.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    @InjectRepository(AnexoEntity)
    private readonly anexoRepository: Repository<AnexoEntity>,
  ) {}

  async findAllTags() {
    const data = await this.tagRepository.find({
      where: { categoria: false },
    });
    return data;
  }

  async findAllCategoria() {
    try {
      const tags = await this.tagRepository.find({
        where: { categoria: true },
      });

      const newTags: TagDTO[] = await Promise.all(
        tags.map(async (tag) => {
          const anexo = await this.anexoRepository
            .createQueryBuilder('anexo')
            .leftJoinAndSelect('anexo.tags', 'tag')
            .where('tag.id = :tag', { tag: tag.id })
            .getManyAndCount();
          const newtag: TagDTO = {
            id: tag.id,
            categoria: tag.categoria,
            descricao: tag.descricao,
            nome: tag.nome,
            quantidadeAnexo: anexo[1],
          };

          return newtag;
        }),
      );
      return newTags;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async createTag(tagDTO: TagDTO) {
    const data = await this.tagRepository.save(tagDTO);
    return data;
  }

  async updateTag(id: number, tagDTO: UpdateTagDTO) {
    const data = await this.tagRepository.findOne({ where: { id: id } });
    if (!data) {
      throw new NotFoundException({ message: 'Tag não encontrada' });
    }
    await this.tagRepository.update(id, tagDTO);
  }

  async destroyTag(id: number) {
    const data = await this.tagRepository.findOne({
      where: { id: id },
    });
    if (!data) {
      throw new NotFoundException({ message: 'Tag não encontrada' });
    }
    await this.tagRepository.delete(id);
    return true;
  }
}
