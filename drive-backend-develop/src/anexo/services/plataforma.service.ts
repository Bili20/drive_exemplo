import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { TIPO, UNLINKASYNC } from 'src/constants/constants';
import { TagEntity } from 'src/tag/entities/tag.entity';
import { Repository } from 'typeorm';
import { FindPaginationDTO } from '../dtos/pagination.dto';
import { PlataformaDTO } from '../dtos/plataforma.dto';
import { PlataformaEntity } from '../entities/plataforma.entity';
import { getAnexoFactory } from '../retornos/getAnexo';

@Injectable()
export class PlataformaService {
  constructor(
    @InjectRepository(PlataformaEntity)
    private readonly plataformaRepository: Repository<PlataformaEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
  ) {}

  async cratePlataforma(plataformaDTO: PlataformaDTO) {
    try {
      const newTag = [] as TagEntity[];
      const newPlataforma = new PlataformaEntity();
      newPlataforma.nomeOriginal = plataformaDTO.nomeOriginal;
      newPlataforma.nome = plataformaDTO.nome;
      if (plataformaDTO.capa) {
        newPlataforma.capa = await this.verifyLink(plataformaDTO.capa);
      }
      newPlataforma.titulo = plataformaDTO.titulo;
      newPlataforma.url = plataformaDTO.url;
      newPlataforma.descricao = plataformaDTO.descricao;
      newPlataforma.idCaminhoServidor = plataformaDTO.idcaminho;
      newPlataforma.idTipo = TIPO.VIDEO;

      if (plataformaDTO.tags) {
        for (const idTag of plataformaDTO.tags) {
          const data = await this.tagRepository.findOne({
            where: { id: idTag },
          });
          newTag.push(data);
        }
        const filter = newTag.filter(function (item) {
          return (
            !this[JSON.stringify(item)] && (this[JSON.stringify(item)] = true)
          );
        }, Object.create(null));
        newPlataforma.tags = filter;
      }

      return await this.plataformaRepository.save(newPlataforma);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  private async verifyLink(link: string): Promise<string> {
    const verify = link.startsWith('https://') || link.startsWith('http://');
    if (verify) {
      throw new BadRequestException({ message: 'Tipo da capa invalido' });
    }
    return link;
  }

  async updatePlataforma(id: number, plataformaDTO: PlataformaDTO) {
    const plataforma = await this.plataformaRepository.findOne({
      where: { id: id },
      relations: { caminhoServidor: true },
    });
    if (!plataforma) {
      throw new NotFoundException({ message: 'Video não encontrado' });
    }

    const newPlataforma = new PlataformaEntity();
    newPlataforma.url = plataformaDTO.url;
    newPlataforma.titulo = plataformaDTO.titulo;
    newPlataforma.nomeOriginal = plataformaDTO.nomeOriginal;
    newPlataforma.descricao = plataformaDTO.descricao;
    newPlataforma.capa = plataformaDTO.capa;
    newPlataforma.nome = plataformaDTO.nome;

    await this.plataformaRepository.update(id, newPlataforma);
    if (
      existsSync(
        await getAnexoFactory.filePath(
          plataforma.caminhoServidor.nome,
          plataforma.capa,
        ),
      )
    ) {
      UNLINKASYNC(
        await getAnexoFactory.filePath(
          plataforma.caminhoServidor.nome,
          plataforma.capa,
        ),
      );
    }
    if (
      existsSync(
        await getAnexoFactory.filePath(
          plataforma.caminhoServidor.nome,
          plataforma.nome,
        ),
      )
    ) {
      UNLINKASYNC(
        await getAnexoFactory.filePath(
          plataforma.caminhoServidor.nome,
          plataforma.nome,
        ),
      );
    }
  }

  async findAllPlataforma({ pagina, quantidade }: FindPaginationDTO) {
    try {
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const data = await this.plataformaRepository
        .createQueryBuilder('plataforma')
        .orderBy('plataforma.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();
      return data;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async destroyPlataforma(id: number) {
    try {
      const plataforma = await this.plataformaRepository.findOne({
        where: { id: id },
        relations: { tipo: true, tags: true, caminhoServidor: true },
        withDeleted: true,
      });
      if (!plataforma) {
        throw new NotFoundException({ message: 'Video não encontrada' });
      }
      if (
        existsSync(
          await getAnexoFactory.filePath(
            plataforma.caminhoServidor.nome,
            plataforma.capa,
          ),
        )
      ) {
        UNLINKASYNC(
          await getAnexoFactory.filePath(
            plataforma.caminhoServidor.nome,
            plataforma.capa,
          ),
        );
      }
      if (
        existsSync(
          await getAnexoFactory.filePath(
            plataforma.caminhoServidor.nome,
            plataforma.nome,
          ),
        )
      ) {
        UNLINKASYNC(
          await getAnexoFactory.filePath(
            plataforma.caminhoServidor.nome,
            plataforma.nome,
          ),
        );
      }
      await this.plataformaRepository.delete(id);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
