import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { FindPaginationDTO } from 'src/anexo/dtos/pagination.dto';
import { AnexoEntity } from 'src/anexo/entities/anexo.entity';
import { getAnexoFactory } from 'src/anexo/retornos/getAnexo';
import { UNLINKASYNC } from 'src/constants/constants';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import { Repository } from 'typeorm';
import { SugestaoDTO } from '../dto/sugestao.dto';
import { AnexoSugestaoEntity } from '../entities/anexoSugestao.entity';
import { getSugestaoFactory } from '../retorno/getSugestao';

@Injectable()
export class AnexoSugestaoService {
  constructor(
    @InjectRepository(AnexoSugestaoEntity)
    private readonly anexoSugestaoRepository: Repository<AnexoSugestaoEntity>,
    @InjectRepository(AnexoEntity)
    private readonly anexoRepository: Repository<AnexoEntity>,
    private readonly sugestaoFactory: getSugestaoFactory,
  ) {}
  async findAllSugestao({ pagina, quantidade }: FindPaginationDTO) {
    try {
      const total = await this.anexoSugestaoRepository
        .createQueryBuilder('sugestao')
        .where('sugestao.aprovado is null')
        .getCount();
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const totalPage = Math.ceil(total / quantidade);

      const sugestao = await this.anexoSugestaoRepository
        .createQueryBuilder('sugestao')
        .leftJoinAndSelect('sugestao.caminho', 'caminho')
        .innerJoinAndSelect('sugestao.pessoa', 'pessoa')
        .innerJoinAndSelect('sugestao.tipo', 'tipo')
        .where('sugestao.aprovado is null')
        .orderBy('sugestao.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();
      const estrutura = await this.sugestaoFactory.sugestaoMulti(sugestao);
      return { totalPage, estrutura };
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async findForTipo({ pagina, quantidade, paramId }: FindPaginationDTO) {
    try {
      const total = await this.anexoSugestaoRepository
        .createQueryBuilder('sugestao')
        .innerJoinAndSelect('sugestao.tipo', 'tipo')
        .where('sugestao.aprovado is null and sugestao.idTipo IN (:...id)', {
          id: paramId,
        })
        .getCount();
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const totalPage = Math.ceil(total / quantidade);

      const sugestao = await this.anexoSugestaoRepository
        .createQueryBuilder('sugestao')
        .leftJoinAndSelect('sugestao.caminho', 'caminho')
        .innerJoinAndSelect('sugestao.pessoa', 'pessoa')
        .innerJoinAndSelect('sugestao.tipo', 'tipo')
        .where('sugestao.aprovado is null and sugestao.idTipo IN (:...id)', {
          id: paramId,
        })
        .orderBy('sugestao.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();
      const estrutura = await this.sugestaoFactory.sugestaoMulti(sugestao);

      return { totalPage, estrutura };
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async findSugestaoUser(
    pessoa: PessoaEntity,
    { quantidade, pagina }: FindPaginationDTO,
  ) {
    try {
      const total = await this.anexoSugestaoRepository
        .createQueryBuilder('sugestao')
        .where('sugestao.idPessoa = :id', { id: pessoa.id })
        .getCount();
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const totalPage = Math.ceil(total / quantidade);

      const sugestao = await this.anexoSugestaoRepository
        .createQueryBuilder('sugestao')
        .leftJoinAndSelect('sugestao.caminho', 'caminho')
        .innerJoinAndSelect('sugestao.pessoa', 'pessoa')
        .innerJoinAndSelect('sugestao.tipo', 'tipo')
        .where('sugestao.idPessoa = :id', { id: pessoa.id })
        .orderBy('sugestao.id', 'DESC')
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();
      const estrutura = await this.sugestaoFactory.sugestaoMulti(sugestao);
      return { totalPage, estrutura };
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async createSugestao(sugestaoDTO: SugestaoDTO) {
    try {
      const newSugestao = new AnexoSugestaoEntity();
      newSugestao.nomeOriginal = sugestaoDTO.nomeOriginal;
      newSugestao.nome = sugestaoDTO.nome;
      newSugestao.capa = sugestaoDTO.capa;
      newSugestao.titulo = sugestaoDTO.titulo;
      newSugestao.descricao = sugestaoDTO.descricao;
      newSugestao.idTipo = sugestaoDTO.idTipo;
      newSugestao.idCaminho = sugestaoDTO.idcaminho;
      newSugestao.idPessoa = sugestaoDTO.idPessoa;
      return await this.anexoSugestaoRepository.save(newSugestao);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async toAcceptSugestao(id: number) {
    try {
      const sugestao = await this.anexoSugestaoRepository
        .createQueryBuilder('sugestao')
        .where('sugestao.id = :id and sugestao.aprovado is null', { id: id })
        .getOne();

      if (!sugestao) {
        throw new BadRequestException();
      }
      const newAnexo = new AnexoEntity();
      newAnexo.titulo = sugestao.titulo;
      newAnexo.nome = sugestao.nome;
      newAnexo.nomeOriginal = sugestao.nomeOriginal;
      newAnexo.descricao = sugestao.descricao;
      newAnexo.idTipo = sugestao.idTipo;
      newAnexo.idSugestao = sugestao.id;
      newAnexo.idCaminhoServidor = sugestao.idCaminho;

      sugestao.aprovado = true;
      await this.anexoSugestaoRepository.save(sugestao);

      const data = await this.anexoRepository.save(newAnexo);
      return data.id;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async toDeleteSugestao(id: number) {
    const sugestao = await this.anexoSugestaoRepository
      .createQueryBuilder('sugestao')
      .innerJoinAndSelect('sugestao.caminho', 'caminho')
      .where('sugestao.id = :id and sugestao.aprovado is null', { id: id })
      .getOne();

    if (!sugestao) {
      throw new BadRequestException();
    }
    await this.anexoSugestaoRepository.delete(sugestao.id);

    if (
      existsSync(
        await getAnexoFactory.filePath(sugestao.caminho.nome, sugestao.nome),
      )
    ) {
      UNLINKASYNC(
        await getAnexoFactory.filePath(sugestao.caminho.nome, sugestao.nome),
      );
    }
    const capa = await this.verifyCapa(sugestao.capa);
    if (capa.length == 0) {
      if (
        existsSync(
          await getAnexoFactory.filePath(sugestao.caminho.nome, sugestao.capa),
        )
      ) {
        UNLINKASYNC(
          await getAnexoFactory.filePath(sugestao.caminho.nome, sugestao.capa),
        );
      }
    }
  }

  private async verifyCapa(arquivo: string) {
    const arquivos = await this.anexoSugestaoRepository.find();
    const data = arquivos.filter((capa) => capa.capa == arquivo);
    return data;
  }
}
