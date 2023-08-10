import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { DIAS, TIPO, UNLINKASYNC } from 'src/constants/constants';
import { GaleriaEntity } from 'src/galeria/entities/galeria.entity';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import { TagEntity } from 'src/tag/entities/tag.entity';
import { In, MoreThan, Repository } from 'typeorm';
import { AnexoDTO } from '../dtos/anexo.dto';
import { FindPaginationDTO } from '../dtos/pagination.dto';
import { UpdateAnexoDTO } from '../dtos/updateAnexo.dto';
import { AnexoEntity } from '../entities/anexo.entity';
import { getAnexoFactory } from '../retornos/getAnexo';
import { getAnexoFactoryLixeira } from '../retornos/getAnexoLixeira';
import { ArquivoService } from './arquivo.service';
import { PlataformaService } from './plataforma.service';
import { GaleriaService } from 'src/galeria/services/galeria.service';
dotenv.config();

@Injectable()
export class AnexoService {
  constructor(
    @InjectRepository(AnexoEntity)
    private anexoRepository: Repository<AnexoEntity>,
    @InjectRepository(TagEntity)
    private tagRepository: Repository<TagEntity>,
    private galeriaService: GaleriaService,
    private arquivoService: ArquivoService,
    private plataformaService: PlataformaService,
    private anexoFactory: getAnexoFactory,
    private anexoFactoryLixeira: getAnexoFactoryLixeira,
  ) {}

  async createAnexo(anexoDTO: AnexoDTO) {
    try {
      const newTags = [] as TagEntity[];
      const anexo = new AnexoEntity();
      anexo.titulo = anexoDTO.titulo;
      anexo.descricao = anexoDTO.descricao;
      anexo.idCaminhoServidor = anexoDTO.idcaminho;
      anexo.idTipo = TIPO.IMAGEM;
      anexo.nomeOriginal = anexoDTO.nomeOriginal;
      anexo.nome = anexoDTO.nome;

      if (anexoDTO.tags) {
        for (const idTag of anexoDTO.tags) {
          const tag = await this.tagRepository.findOne({
            where: { id: idTag },
          });
          newTags.push(tag);
        }

        const filter = newTags.filter(function (item) {
          return (
            !this[JSON.stringify(item)] && (this[JSON.stringify(item)] = true)
          );
        }, Object.create(null));
        anexo.tags = filter;
      }
      return anexo;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async saveAnexo(anexoDTO: AnexoDTO) {
    try {
      const anexo = await this.createAnexo(anexoDTO);
      await this.anexoRepository.save(anexo);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async sendAnexoForGaleria(idgaleria: number, idanexos: number[]) {
    try {
      const galeria = await this.galeriaService.findOneGaleria(idgaleria);

      if (galeria) {
        for (const idanexo of idanexos) {
          const anexo = await this.anexoRepository.findOneOrFail({
            where: { id: idanexo },
            relations: { galerias: true },
          });

          const newGalerias = [...anexo.galerias, galeria];
          anexo.galerias = newGalerias;

          await this.anexoRepository.save(anexo);
        }
      }
      return true;
    } catch (e) {
      throw new HttpException(
        e.response ?? 'Anexo já faz parte da galeria',
        e.status ?? 400,
      );
    }
  }

  async removeAnexoFromGaleria(
    idanexo: number,
    idgaleria: number,
    pessoa: PessoaEntity,
  ) {
    try {
      const anexo = await this.anexoRepository.findOne({
        where: {
          id: idanexo,
        },
        relations: { galerias: true },
      });

      for (const index of anexo.galerias) {
        if (index.idPessoa == pessoa.id) {
          anexo.galerias.splice(
            anexo.galerias.findIndex((item) => item.id == idgaleria),
            1,
          );
        }
      }
      this.anexoRepository.save(anexo);

      return true;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async sendAnexoForFavoritos(idanexo: number, pessoa: PessoaEntity) {
    try {
      const galeria = await this.galeriaService.findGaleriaFavorita(pessoa);

      const anexo = await this.anexoRepository.findOneOrFail({
        where: { id: idanexo },
        relations: { galerias: true },
      });
      const newGalerias = [...anexo.galerias, galeria];
      anexo.galerias = newGalerias;

      await this.anexoRepository.save(anexo);
      return true;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async removeAnexoFromFavoritos(idanexo: number) {
    try {
      const anexo = await this.anexoRepository.findOne({
        where: {
          id: idanexo,
        },
        relations: { galerias: true },
      });

      anexo.galerias.splice(
        anexo.galerias.findIndex((item) => item.favorito),
        1,
      );

      this.anexoRepository.save(anexo);

      return anexo;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async findAllAnexo({ quantidade, pagina }: FindPaginationDTO) {
    try {
      const total = await this.anexoRepository.findAndCount();
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const totalPage = Math.ceil(total[1] / quantidade);
      const anexo = await this.anexoRepository
        .createQueryBuilder('anexo')
        .leftJoinAndSelect('anexo.tags', 'tags')
        .innerJoinAndSelect('anexo.tipo', 'tipo')
        .innerJoinAndSelect('anexo.caminhoServidor', 'caminho')
        .orderBy('anexo.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();
      const estrutura = await this.anexoFactory.anexoMulti(anexo);

      return { totalPage, estrutura };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findAllForTipo(
    tipo: number,
    { quantidade, pagina }: FindPaginationDTO,
  ) {
    try {
      const total = await this.anexoRepository.findAndCount({
        where: { idTipo: tipo },
      });
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const totalPage = Math.ceil(total[1] / quantidade);
      const anexo = await this.anexoRepository
        .createQueryBuilder('anexo')
        .leftJoinAndSelect('anexo.tags', 'tags')
        .innerJoinAndSelect('anexo.tipo', 'tipo')
        .innerJoinAndSelect('anexo.caminhoServidor', 'caminho')
        .where('anexo.id_tipo = :tipo', { tipo: tipo })
        .orderBy('anexo.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();
      const estrutura = await this.anexoFactory.anexoMulti(anexo);
      return { totalPage, estrutura };
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async findAnexoForTag({
    quantidade = 10,
    pagina = 1,
    paramId,
  }: FindPaginationDTO) {
    try {
      const total = await this.anexoRepository
        .createQueryBuilder('anexo')
        .leftJoinAndSelect('anexo.tags', 'tag')
        .where(
          `anexo.id IN (
          SELECT id_anexo 
          FROM ${process.env.DB_PG_SCHEMA}.tags_anexos 
          WHERE id_tag IN (:...paramId)
          GROUP BY id_anexo
          HAVING COUNT(*) >= :tagCount
        )`,
          { paramId, tagCount: paramId.length },
        )
        .getCount();
      const totalPage = Math.ceil(total / quantidade);
      const data = await this.anexoRepository
        .createQueryBuilder('anexo')
        .innerJoinAndSelect('anexo.tags', 'tag')
        .innerJoinAndSelect('anexo.tipo', 'tipo')
        .innerJoinAndSelect('anexo.caminhoServidor', 'caminho')
        .where(
          `anexo.id IN (
          SELECT id_anexo 
          FROM ${process.env.DB_PG_SCHEMA}.tags_anexos 
          WHERE id_tag IN (:...paramId)
          GROUP BY id_anexo
          HAVING COUNT(*) >= :tagCount
        )`,
          { paramId, tagCount: paramId.length },
        )
        .orderBy('anexo.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();
      const estrutura = await this.anexoFactory.anexoMulti(data);
      return { totalPage, estrutura };
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async findAnexoSemTag({ quantidade, pagina }: FindPaginationDTO) {
    try {
      const total = await this.anexoRepository
        .createQueryBuilder('anexo')
        .leftJoinAndSelect('anexo.tags', 'tag')
        .where('tag is null')
        .getCount();
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const totalPage = Math.ceil(total / quantidade);
      const anexos = await this.anexoRepository
        .createQueryBuilder('anexo')
        .leftJoinAndSelect('anexo.tags', 'tag')
        .innerJoinAndSelect('anexo.tipo', 'tipo')
        .innerJoinAndSelect('anexo.caminhoServidor', 'caminho')
        .where('tag is null')
        .orderBy('anexo.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();
      const estrutura = await this.anexoFactory.anexoMulti(anexos);
      return { totalPage, estrutura };
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async findForTituloOrNomeOriginalOrTag({
    quantidade,
    pagina,
    nome,
    paramId,
  }: FindPaginationDTO) {
    try {
      paramId = paramId ?? [0];
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      nome = nome ?? '';
      const total = await this.anexoRepository
        .createQueryBuilder('anexo')
        .leftJoinAndSelect('anexo.tags', 'tag')
        .innerJoinAndSelect('anexo.tipo', 'tipo')
        .innerJoinAndSelect('anexo.caminhoServidor', 'caminho')
        .where(
          '(anexo.titulo ilike :titulo or anexo.nomeOriginal ilike :nomeOriginal or tag.id IN (:...id))',
          { titulo: `%${nome}%`, nomeOriginal: `%${nome}%`, id: paramId },
        )
        .getCount();
      const totalPage = Math.ceil(total / quantidade);

      const anexo = await this.anexoRepository
        .createQueryBuilder('anexo')
        .leftJoinAndSelect('anexo.tags', 'tag')
        .innerJoinAndSelect('anexo.tipo', 'tipo')
        .innerJoinAndSelect('anexo.caminhoServidor', 'caminho')
        .where(
          '(anexo.titulo ilike :titulo or anexo.nomeOriginal ilike :nomeOriginal or tag.id IN (:...id))',
          { titulo: `%${nome}%`, nomeOriginal: `%${nome}%`, id: paramId },
        )
        .orderBy('anexo.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();

      const estrutura = await this.anexoFactory.anexoMulti(anexo);
      return { totalPage, estrutura };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findGaleriaAnexosForTag(
    hash: string,
    { quantidade = 10, pagina = 1, paramId = [0] }: FindPaginationDTO,
  ) {
    try {
      const total = await this.anexoRepository
        .createQueryBuilder('anexo')
        .leftJoinAndSelect('anexo.galerias', 'galeria')
        .leftJoinAndSelect('anexo.tags', 'tag')
        .where(
          `anexo.id IN (
          SELECT id_anexo 
          FROM ${process.env.DB_PG_SCHEMA}.tags_anexos 
          WHERE id_tag IN (:...paramId)
          GROUP BY id_anexo
          HAVING COUNT(*) >= :tagCount
        )`,
          { paramId, tagCount: paramId.length },
        )
        .andWhere('galeria.hash = :hash', { hash: hash })
        .getCount();
      const totalPage = Math.ceil(total / quantidade);

      const data = await this.anexoRepository
        .createQueryBuilder('anexo')
        .leftJoinAndSelect('anexo.tags', 'tag')
        .innerJoinAndSelect('anexo.tipo', 'tipo')
        .innerJoinAndSelect('anexo.caminhoServidor', 'caminho')
        .leftJoinAndSelect('anexo.galerias', 'galeria')
        .where(
          `anexo.id IN (
          SELECT id_anexo 
          FROM ${process.env.DB_PG_SCHEMA}.tags_anexos 
          WHERE id_tag IN (:...paramId)
          GROUP BY id_anexo
          HAVING COUNT(*) >= :tagCount
        )`,
          { paramId, tagCount: paramId.length },
        )
        .andWhere('galeria.hash = :hash', { hash: hash })
        .orderBy('anexo.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();
      const estrutura = await this.anexoFactory.anexoMulti(data);
      const infoGaleria = await this.galeriaService.findNameAndPublicOfGaleria(
        hash,
      );
      return { infoGaleria, totalPage, estrutura };
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async findGaleriaAnexos(
    hash: string,
    { quantidade, pagina }: FindPaginationDTO,
  ) {
    try {
      const total = await this.anexoRepository
        .createQueryBuilder('anexo')
        .leftJoinAndSelect('anexo.galerias', 'galeria')
        .where('galeria.hash = :hash', { hash: hash })
        .getCount();
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const totalPage = Math.ceil(total / quantidade);

      const data = await this.anexoRepository
        .createQueryBuilder('anexo')
        .leftJoinAndSelect('anexo.tags', 'tag')
        .innerJoinAndSelect('anexo.tipo', 'tipo')
        .innerJoinAndSelect('anexo.caminhoServidor', 'caminho')
        .leftJoinAndSelect('anexo.galerias', 'galeria')
        .where('galeria.hash = :hash', {
          hash: hash,
        })
        .orderBy('anexo.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();
      const estrutura = await this.anexoFactory.anexoMulti(data);
      const infoGaleria = await this.galeriaService.findNameAndPublicOfGaleria(
        hash,
      );
      return { infoGaleria, totalPage, estrutura };
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async findOne(id: number) {
    const data = await this.anexoRepository.findOne({
      where: { id: id },
      relations: { tipo: true, tags: true, caminhoServidor: true },
    });
    if (!data) {
      throw new NotFoundException({ message: 'Anexo não encontrado' });
    }
    return await this.anexoFactory.anexoEstrutura(data);
  }

  async sendTotrashAnexo(ids: number[]) {
    try {
      const anexos = await this.anexoRepository.find({
        where: { id: In(ids) },
      });

      for (const anexo of anexos) {
        await this.anexoRepository.softDelete(anexo.id);
      }

      return true;
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async findForDate({ data, pagina, quantidade }: FindPaginationDTO) {
    try {
      const total = await this.anexoRepository
        .createQueryBuilder('anexo')
        .where(
          `extract('day' from anexo.dataCadastro) = ${String(
            data.getDate() + 1,
          ).padStart(
            2,
            '0',
          )} and extract('month' from anexo.dataCadastro) = ${String(
            data.getMonth() + 1,
          ).padStart(
            2,
            '0',
          )} and extract('year' from anexo.dataCadastro) = ${data.getFullYear()}`,
        )
        .getCount();

      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const totalPage = Math.ceil(total / quantidade);
      const anexos = await this.anexoRepository
        .createQueryBuilder('anexo')
        .where(
          `extract('day' from anexo.dataCadastro) = ${String(
            data.getDate() + 1,
          ).padStart(
            2,
            '0',
          )} and extract('month' from anexo.dataCadastro) = ${String(
            data.getMonth() + 1,
          ).padStart(
            2,
            '0',
          )} and extract('year' from anexo.dataCadastro) = ${data.getFullYear()}`,
        )
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();

      return { totalPage, anexos };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findTrashAnexo({ pagina, quantidade }: FindPaginationDTO) {
    try {
      const total = await this.anexoRepository.findAndCount({
        withDeleted: true,
        where: { deleteAt: MoreThan(new Date('1900-01-01')) },
      });
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const totalPage = Math.ceil(total[1] / quantidade);
      const data = await this.anexoRepository.find({
        withDeleted: true,
        relations: { tipo: true, tags: true, caminhoServidor: true },
        where: { deleteAt: MoreThan(new Date('1900-01-01')) },
        order: { id: 'DESC' },
        take: quantidade,
        skip: (pagina - 1) * quantidade,
      });
      const estrutura = await this.anexoFactoryLixeira.anexoMultiLixeira(data);

      return { totalPage, estrutura };
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @Cron('30 22 */1 * *')
  async cleanTrashCron() {
    try {
      const lixeiraAnexo = await this.anexoRepository
        .createQueryBuilder('lixeira')
        .withDeleted()
        .innerJoinAndSelect('lixeira.caminhoServidor', 'caminho')
        .where(
          `lixeira.deleteAt > '1900-01-01' and lixeira.deleteAt < current_date - ${DIAS}`,
        )
        .getMany();
      for (const anexo of lixeiraAnexo) {
        if (anexo.idTipo == TIPO.DOCUMENTO) {
          await this.arquivoService.destroyArquivo(anexo.id);
        } else if (anexo.idTipo == TIPO.VIDEO) {
          await this.plataformaService.destroyPlataforma(anexo.id);
        } else {
          const data = await this.anexoRepository.delete(anexo.id);

          if (
            existsSync(
              await getAnexoFactory.filePath(
                anexo.caminhoServidor.nome,
                anexo.nome,
              ),
            )
          ) {
            UNLINKASYNC(
              await getAnexoFactory.filePath(
                anexo.caminhoServidor.nome,
                anexo.nome,
              ),
            );
          }

          if (!data.affected) {
            throw new BadRequestException();
          }
        }
      }
      return true;
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async cleanTrash() {
    try {
      const lixeiraAnexo = await this.anexoRepository
        .createQueryBuilder('lixeira')
        .withDeleted()
        .innerJoinAndSelect('lixeira.caminhoServidor', 'caminho')
        .where(`lixeira.deleteAt > '1900-01-01'`)
        .getMany();
      for (const anexo of lixeiraAnexo) {
        if (anexo.idTipo == TIPO.DOCUMENTO) {
          await this.arquivoService.destroyArquivo(anexo.id);
        } else if (anexo.idTipo == TIPO.VIDEO) {
          await this.plataformaService.destroyPlataforma(anexo.id);
        } else {
          const data = await this.anexoRepository.delete(anexo.id);

          if (
            existsSync(
              await getAnexoFactory.filePath(
                anexo.caminhoServidor.nome,
                anexo.nome,
              ),
            )
          ) {
            UNLINKASYNC(
              await getAnexoFactory.filePath(
                anexo.caminhoServidor.nome,
                anexo.nome,
              ),
            );
          }

          if (!data.affected) {
            throw new BadRequestException();
          }
        }
      }
      return true;
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async destroyAnexos(ids: number[]) {
    try {
      for (const data of ids) {
        const anexo = await this.anexoRepository.findOne({
          withDeleted: true,
          relations: { caminhoServidor: true },
          where: { deleteAt: MoreThan(new Date('1900-01-01')), id: data },
        });
        if (!anexo) {
          throw new NotFoundException({ message: 'Anexo não encontrado' });
        }
        if (anexo.idTipo == TIPO.DOCUMENTO) {
          await this.arquivoService.destroyArquivo(data);
        } else if (anexo.idTipo == TIPO.VIDEO) {
          await this.plataformaService.destroyPlataforma(data);
        } else {
          await this.anexoRepository.delete(data);
          if (
            existsSync(
              await getAnexoFactory.filePath(
                anexo.caminhoServidor.nome,
                anexo.nome,
              ),
            )
          ) {
            UNLINKASYNC(
              await getAnexoFactory.filePath(
                anexo.caminhoServidor.nome,
                anexo.nome,
              ),
            );
          }
        }
      }
      return true;
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async restoreAnexo(ids: number[]) {
    try {
      for (const anexo of ids) {
        const data = await this.anexoRepository.restore(anexo);
        if (!data.affected) {
          throw new BadRequestException();
        }
      }
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async updateAnexo(id: number, anexoDTO: UpdateAnexoDTO) {
    try {
      const anexo = await this.anexoRepository.findOne({
        where: {
          id: id,
        },
        relations: { caminhoServidor: true },
      });
      const newAnexo = new AnexoEntity();
      newAnexo.descricao = anexoDTO.descricao;
      newAnexo.nome = anexoDTO.nome;
      newAnexo.nomeOriginal = anexoDTO.nomeOriginal;
      newAnexo.titulo = anexoDTO.titulo;

      await this.anexoRepository.update(id, newAnexo);

      if (anexoDTO.nome) {
        if (
          existsSync(
            await getAnexoFactory.filePath(
              anexo.caminhoServidor.nome,
              anexo.nome,
            ),
          )
        ) {
          UNLINKASYNC(
            await getAnexoFactory.filePath(
              anexo.caminhoServidor.nome,
              anexo.nome,
            ),
          );
        }
      }

      return true;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async updateAnexoTag(idanexo: number, idtags: number[]) {
    const newTags = [] as TagEntity[];
    const anexo = await this.anexoRepository.findOne({
      where: { id: idanexo },
      relations: { tags: true },
    });

    for (const idtag of idtags) {
      const tag = await this.tagRepository.findOne({
        where: { id: idtag },
      });
      newTags.push(tag);
    }
    anexo.tags = newTags;
    await this.anexoRepository.save(anexo);
  }
}
