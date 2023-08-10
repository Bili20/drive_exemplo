import { AnexoEntity } from 'src/anexo/entities/anexo.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tag')
export class TagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  descricao: string;

  @Column({ default: false })
  categoria: boolean;

  @ManyToMany(() => AnexoEntity, (anexo: AnexoEntity) => anexo.tags)
  @JoinTable({
    name: 'tags_anexos',
    joinColumn: { name: 'id_tag', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_anexo', referencedColumnName: 'id' },
  })
  anexo: AnexoEntity[];
}
