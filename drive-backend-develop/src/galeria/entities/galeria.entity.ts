import { AnexoEntity } from 'src/anexo/entities/anexo.entity';
import { GrupoEntity } from 'src/grupo/entities/grupo.entity';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('galeria')
export class GaleriaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_cadastro',
  })
  dataCadastro: Date;

  @Column()
  publica: boolean;

  @Column()
  favorito: boolean;

  @Column({ name: 'id_pessoa' })
  idPessoa: number;

  @Column()
  hash: string;

  @Column({ name: 'id_grupo' })
  idGrupo: number;

  @ManyToMany(() => AnexoEntity, (anexo: AnexoEntity) => anexo.galerias)
  @JoinTable({
    name: 'galerias_anexos',
    joinColumn: { name: 'id_galeria', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_anexo', referencedColumnName: 'id' },
  })
  anexo: AnexoEntity[];

  @ManyToOne(() => PessoaEntity, (pessoa: PessoaEntity) => pessoa.galeria)
  @JoinColumn({ name: 'id_pessoa' })
  pessoa: PessoaEntity;

  @ManyToOne(() => GrupoEntity, (grupo: GrupoEntity) => grupo.galeria)
  @JoinColumn({ name: 'id_grupo' })
  grupo: GrupoEntity;
}
