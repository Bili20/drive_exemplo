import { Injectable } from '@nestjs/common';
import { AnexoSugestaoEntity } from '../entities/anexoSugestao.entity';
import { ISugestao } from './interfaceSugestao';
import { FOLDER_STORAGE, url } from 'src/constants/constants';

@Injectable()
export class getSugestaoFactory {
  constructor() {}

  async sugestaoEstrutura(sugestao: AnexoSugestaoEntity): Promise<ISugestao> {
    const estrutura = {} as ISugestao;

    estrutura.id = sugestao.id;
    estrutura.descricao = sugestao.descricao;
    estrutura.titulo = sugestao.titulo;
    estrutura.nomeOriginal = sugestao.nomeOriginal;
    estrutura.file = await this.fileUrl(sugestao.caminho.nome, sugestao.nome);
    if (sugestao.capa) {
      estrutura.capa = await this.fileUrl(sugestao.caminho.nome, sugestao.capa);
    }
    estrutura.aprovado = sugestao.aprovado;
    estrutura.nome = sugestao.pessoa.nome;
    estrutura.tipoId = sugestao.tipo.id;
    estrutura.tipo = sugestao.tipo.nome;

    return estrutura;
  }

  async sugestaoMulti(sugestoes: AnexoSugestaoEntity[]): Promise<ISugestao[]> {
    const newSugestoes = [] as ISugestao[];
    for (const sugestao of sugestoes) {
      const estrutura = await this.sugestaoEstrutura(sugestao);
      newSugestoes.push(estrutura);
    }
    return newSugestoes;
  }

  private async fileUrl(dir: string, filesname: string): Promise<string> {
    const path = FOLDER_STORAGE;
    const formatadoPath = path.replace(/\./, '');
    const newurl = url + formatadoPath + dir + '/' + filesname;
    return newurl;
  }
}
