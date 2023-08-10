import { DB_ORACLE_DATABASE } from 'src/config/typeOrmConfig';
import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity('AD_PETIM_AUTENTICACAO', { schema: DB_ORACLE_DATABASE })
export class UsersSankhya {
  @ViewColumn({ name: 'EMPRESA' })
  Empresa?: number;

  @ViewColumn({ name: 'CODSETOR' })
  CodSetor: number;

  @ViewColumn({ name: 'SETOR' })
  Setor: string;

  @ViewColumn({ name: 'MATRICULA' })
  Cracha: number;

  @ViewColumn({ name: 'NOME' })
  Nome: string;

  @ViewColumn({ name: 'EMAIL' })
  Email: string;

  @ViewColumn({ name: 'CPF' })
  Cpf: string;

  @ViewColumn({ name: 'CODCARGAHOR' })
  CargaHoraria: number;

  @ViewColumn({ name: 'USUARIO' })
  Usuario: string;

  @ViewColumn({ name: 'ATIVO' })
  Ativo: string;

  @ViewColumn({ name: 'TIPO' })
  Tipo: string;

  @ViewColumn({ name: 'SENHA' })
  Senha: string;

  @ViewColumn({ name: 'UNIDADE' })
  Unidade: string;

  @ViewColumn({ name: 'CODUNIDADE' })
  CodUnidade: number;

  @ViewColumn({ name: 'DATA_ALTERACAO' })
  DataAlteracao: Date;
}
