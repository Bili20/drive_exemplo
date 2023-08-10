import { AnexoSugestaoEntity } from 'src/anexo-sugestao/entities/anexoSugestao.entity';
import { GaleriaEntity } from 'src/galeria/entities/galeria.entity';
import { GrupoEntity } from 'src/grupo/entities/grupo.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('pessoa')
export class PessoaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column()
  senha: string;

  @Column()
  cpf: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'data_cadastro',
  })
  dataCadastro: Date;

  @Column({ name: 'id_grupo' })
  idGrupo: number;

  @ManyToOne(() => GrupoEntity, (grupo: GrupoEntity) => grupo.pessoa)
  @JoinColumn({ name: 'id_grupo' })
  grupo: GrupoEntity;

  @OneToMany(() => GaleriaEntity, (galeria: GaleriaEntity) => galeria.pessoa)
  galeria: GaleriaEntity[];

  @OneToMany(
    () => AnexoSugestaoEntity,
    (anexoSugestao: AnexoSugestaoEntity) => anexoSugestao.pessoa,
  )
  anexoSugestao: AnexoSugestaoEntity[];
}
