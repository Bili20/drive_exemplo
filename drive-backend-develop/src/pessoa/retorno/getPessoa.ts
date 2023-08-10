import { Injectable } from '@nestjs/common';
import { PessoaEntity } from '../entities/pessoa.entity';
import { IPessoa } from './interfacePessoa';

@Injectable()
export class PessoaFactory {
  async pessoaEstrutura(pessoa: PessoaEntity): Promise<IPessoa> {
    const estrutura = {} as IPessoa;

    estrutura.id = pessoa.id;
    estrutura.nome = pessoa.nome;
    if (pessoa.idGrupo) {
      estrutura.grupo = pessoa.grupo.nome;
    }

    return estrutura;
  }

  async pessoaMulti(pessoas: PessoaEntity[]): Promise<IPessoa[]> {
    const estruturaPessoa = [] as IPessoa[];

    for (const pessoa of pessoas) {
      const estrutura = await this.pessoaEstrutura(pessoa);
      estruturaPessoa.push(estrutura);
    }
    return estruturaPessoa;
  }
}
