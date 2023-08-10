import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArquivoEntity } from '../entities/arquivo.entity';
import { Repository } from 'typeorm';
import { ArquivoDTO } from '../dtos/arquivo.dto';
import { FindPaginationDTO } from '../dtos/pagination.dto';
import { TIPO, UNLINKASYNC } from 'src/constants/constants';
import { UpdateArquivoDTO } from '../dtos/updateArquivo.dto';
import { TagEntity } from 'src/tag/entities/tag.entity';
import { existsSync } from 'fs';
import { getAnexoFactory } from '../retornos/getAnexo';

@Injectable()
export class ArquivoService {
  constructor(
    @InjectRepository(ArquivoEntity)
    private readonly arquivoRepository: Repository<ArquivoEntity>,
    @InjectRepository(TagEntity)
    private readonly tagRepository: Repository<TagEntity>,
    private anexoFactory: getAnexoFactory,
  ) {}

  async createArquivo(arquivoDTO: ArquivoDTO) {
    try {
      const newTag = [] as TagEntity[];
      const newArquivo = new ArquivoEntity();
      newArquivo.nome = arquivoDTO.nome;
      newArquivo.nomeOriginal = arquivoDTO.nomeOriginal;
      newArquivo.titulo = arquivoDTO.titulo;
      newArquivo.descricao = arquivoDTO.descricao;
      if (arquivoDTO.capa) {
        newArquivo.capa = await this.verifyLink(arquivoDTO.capa);
      }
      newArquivo.idCaminhoServidor = arquivoDTO.idcaminho;
      newArquivo.idTipo = TIPO.DOCUMENTO;

      if (arquivoDTO.tags) {
        for (const idTag of arquivoDTO.tags) {
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
        newArquivo.tags = filter;
      }
      await this.arquivoRepository.save(newArquivo);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  private async verifyLink(link: string): Promise<string> {
    const verify = link.startsWith('https://') || link.startsWith('http://');
    if (verify) {
      throw new BadRequestException({ message: 'Tipo da capa invalido' });
    }
    return link;
  }

  async findAllArquivo({ pagina, quantidade }: FindPaginationDTO) {
    try {
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const data = await this.arquivoRepository
        .createQueryBuilder('arquivo')
        .leftJoinAndSelect('arquivo.tags', 'tags')
        .orderBy('arquivo.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();

      return data;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async destroyArquivo(id: number) {
    try {
      const arquivo = await this.arquivoRepository.findOne({
        where: { id: id },
        relations: { tipo: true, tags: true, caminhoServidor: true },
        withDeleted: true,
      });
      if (!arquivo) {
        throw new NotFoundException({ message: 'Arquivo não encontrado' });
      }

      await this.arquivoRepository.delete(id);

      if (
        existsSync(
          await getAnexoFactory.filePath(
            arquivo.caminhoServidor.nome,
            arquivo.nome,
          ),
        )
      ) {
        UNLINKASYNC(
          await getAnexoFactory.filePath(
            arquivo.caminhoServidor.nome,
            arquivo.nome,
          ),
        );

        const capa = await this.verifyCapa(arquivo.capa);
        if (capa.length == 0) {
          if (
            existsSync(
              await getAnexoFactory.filePath(
                arquivo.caminhoServidor.nome,
                arquivo.capa,
              ),
            )
          ) {
            UNLINKASYNC(
              await getAnexoFactory.filePath(
                arquivo.caminhoServidor.nome,
                arquivo.capa,
              ),
            );
          }
        }
      }
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async updateArquivo(id: number, arquivoDTO: UpdateArquivoDTO) {
    try {
      const arquivo = await this.arquivoRepository.findOne({
        where: { id: id },
        relations: { caminhoServidor: true },
      });
      if (!arquivo) {
        throw new NotFoundException({ message: 'Arquivo não encontrado' });
      }
      const newArquivo = new ArquivoEntity();
      newArquivo.titulo = arquivoDTO.titulo;
      newArquivo.descricao = arquivoDTO.descricao;
      newArquivo.nome = arquivoDTO.nome;
      newArquivo.nomeOriginal = arquivoDTO.nomeOriginal;
      newArquivo.capa = arquivoDTO.capa;

      await this.arquivoRepository.update(id, newArquivo);
      if (arquivoDTO.nome) {
        UNLINKASYNC(
          await getAnexoFactory.filePath(
            arquivo.caminhoServidor.nome,
            arquivo.nome,
          ),
        );
      }

      const capa = await this.verifyCapa(arquivo.capa);
      if (capa.length == 0) {
        if (
          existsSync(
            await getAnexoFactory.filePath(
              arquivo.caminhoServidor.nome,
              arquivo.capa,
            ),
          )
        ) {
          UNLINKASYNC(
            await getAnexoFactory.filePath(
              arquivo.caminhoServidor.nome,
              arquivo.capa,
            ),
          );
        }
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  private async verifyCapa(arquivo: string) {
    const arquivos = await this.arquivoRepository.find();
    const data = arquivos.filter((capa) => capa.capa == arquivo);
    return data;
  }
}
