import { Injectable } from '@nestjs/common';
import { AnexoEntity } from '../entities/anexo.entity';
import { IAnexo, ITag } from './intefaceAnexo';
import { FOLDER_STORAGE, url } from 'src/constants/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { ArquivoEntity } from '../entities/arquivo.entity';
import { Repository } from 'typeorm';
import { PlataformaEntity } from '../entities/plataforma.entity';

@Injectable()
export class getAnexoFactory {
  constructor(
    @InjectRepository(ArquivoEntity)
    private arquivoRepository: Repository<ArquivoEntity>,
    @InjectRepository(PlataformaEntity)
    private plataformaRepository: Repository<PlataformaEntity>,
  ) {}

  async anexoEstrutura(anexo: AnexoEntity): Promise<IAnexo> {
    const anexoFormatado = {} as IAnexo;

    const tags: ITag[] = [];

    anexoFormatado.id = anexo.id;
    anexoFormatado.titulo = anexo.titulo;
    anexoFormatado.tipo = anexo.tipo.nome;
    anexoFormatado.idTipo = anexo.idTipo;
    anexoFormatado.nomeOriginal = anexo.nomeOriginal;
    anexoFormatado.dataCadastro = anexo.dataCadastro;
    if (anexo.nome) {
      anexoFormatado.nome = await this.fileUrl(
        anexo.caminhoServidor.nome,
        anexo.nome,
      );
    }
    if (anexo.descricao) {
      anexoFormatado.descricao = anexo.descricao;
    }
    if (anexo.idTipo != 1) {
      const arquivo = await this.arquivoRepository.findOne({
        where: { id: anexo.id },
        relations: { caminhoServidor: true },
      });
      const plataforma = await this.plataformaRepository.findOne({
        where: { id: anexo.id },
        relations: { caminhoServidor: true },
      });
      if (plataforma) {
        if (plataforma.capa != null) {
          anexoFormatado.capa = await this.fileUrl(
            plataforma.caminhoServidor.nome,
            plataforma.capa,
          );
        }
        anexoFormatado.url = plataforma.url;
      }
      if (arquivo) {
        if (arquivo.capa != null) {
          anexoFormatado.capa = await this.fileUrl(
            arquivo.caminhoServidor.nome,
            arquivo.capa,
          );
        }
      }
    }

    for (const tag of anexo.tags) {
      const tagsFormatado = {} as ITag;
      tagsFormatado.id = tag.id;
      tagsFormatado.nome = tag.nome;
      tagsFormatado.categoria = tag.categoria;

      tags.push(tagsFormatado);
    }
    anexoFormatado.tags = tags;

    return anexoFormatado;
  }

  async anexoMulti(anexos: AnexoEntity[]): Promise<IAnexo[]> {
    const anexoFormatado: IAnexo[] = [];

    for (const anexo of anexos) {
      const estrutura = await this.anexoEstrutura(anexo);
      anexoFormatado.push(estrutura);
    }

    return anexoFormatado;
  }
  private async fileUrl(dir: string, filesname: string): Promise<string> {
    const path = FOLDER_STORAGE;
    const formatadoPath = path.replace(/\./, '');
    const newurl = url + formatadoPath + dir + '/' + filesname;
    return newurl;
  }

  static async filePath(dir: string, filesname: string): Promise<string> {
    const path = FOLDER_STORAGE;
    const newurl = path + dir + '/' + filesname;
    return newurl;
  }
}
