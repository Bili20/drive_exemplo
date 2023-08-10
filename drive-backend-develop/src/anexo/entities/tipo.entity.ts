import { AnexoSugestaoEntity } from 'src/anexo-sugestao/entities/anexoSugestao.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AnexoEntity } from './anexo.entity';

@Entity('tipo')
export class TipoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @OneToMany(() => AnexoEntity, (anexo: AnexoEntity) => anexo.tipo)
  anexo: AnexoEntity[];

  @OneToMany(
    () => AnexoSugestaoEntity,
    (anexoSugestao: AnexoSugestaoEntity) => anexoSugestao.tipo,
  )
  anexoSugestao: AnexoSugestaoEntity[];
}
