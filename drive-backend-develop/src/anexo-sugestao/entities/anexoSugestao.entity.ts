import { AnexoEntity } from 'src/anexo/entities/anexo.entity';
import { TipoEntity } from 'src/anexo/entities/tipo.entity';
import { CaminhoServidorEntity } from 'src/caminho-servidor/entities/caminho-servidor.entity';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sugestao_anexo')
export class AnexoSugestaoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  capa: string;

  @Column({ name: 'nome_original' })
  nomeOriginal: string;

  @Column()
  titulo: string;

  @Column()
  descricao: string;

  @Column({ default: false })
  aprovado: boolean;

  @Column({ name: 'data_cadastro' })
  dataCadastro: Date;

  @Column({ name: 'id_pessoa' })
  idPessoa: number;

  @Column({ name: 'id_tipo' })
  idTipo: number;

  @Column({ name: 'id_caminho_servidor' })
  idCaminho: number;

  @ManyToOne(() => PessoaEntity, (pessoa: PessoaEntity) => pessoa.anexoSugestao)
  @JoinColumn({ name: 'id_pessoa' })
  pessoa: PessoaEntity;

  @ManyToOne(
    () => CaminhoServidorEntity,
    (caminho: CaminhoServidorEntity) => caminho.sugestao,
  )
  @JoinColumn({ name: 'id_caminho_servidor' })
  caminho: CaminhoServidorEntity;

  @OneToOne(() => AnexoEntity, (anexo: AnexoEntity) => anexo.anexoSugestao)
  anexo: AnexoEntity;

  @ManyToOne(() => TipoEntity, (tipo: TipoEntity) => tipo.anexoSugestao)
  @JoinColumn({ name: 'id_tipo' })
  tipo: TipoEntity;
}
