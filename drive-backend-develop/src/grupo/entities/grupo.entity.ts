import { GaleriaEntity } from 'src/galeria/entities/galeria.entity';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('grupo')
export class GrupoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @OneToMany(() => PessoaEntity, (pessoa: PessoaEntity) => pessoa.grupo)
  pessoa: PessoaEntity[];

  @OneToMany(() => GaleriaEntity, (galeria: GaleriaEntity) => galeria.grupo)
  galeria: GaleriaEntity[];
}
