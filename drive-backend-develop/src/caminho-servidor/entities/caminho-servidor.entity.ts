import { AnexoSugestaoEntity } from 'src/anexo-sugestao/entities/anexoSugestao.entity';
import { AnexoEntity } from 'src/anexo/entities/anexo.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('caminho_servidor')
export class CaminhoServidorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @OneToMany(() => AnexoEntity, (anexo: AnexoEntity) => anexo.caminhoServidor)
  anexo: AnexoEntity[];

  @OneToMany(
    () => AnexoSugestaoEntity,
    (sugestao: AnexoSugestaoEntity) => sugestao.caminho,
  )
  sugestao: AnexoSugestaoEntity[];
}
