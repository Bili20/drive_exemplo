import { AnexoSugestaoEntity } from 'src/anexo-sugestao/entities/anexoSugestao.entity';
import { CaminhoServidorEntity } from 'src/caminho-servidor/entities/caminho-servidor.entity';
import { GaleriaEntity } from 'src/galeria/entities/galeria.entity';
import { TagEntity } from 'src/tag/entities/tag.entity';
import {
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { AnexoAbstract } from './anexo.abstract.entity';
import { TipoEntity } from './tipo.entity';

@Entity('anexo')
export class AnexoEntity extends AnexoAbstract {
  @ManyToOne(() => TipoEntity, (tipo: TipoEntity) => tipo.anexo)
  @JoinColumn({ name: 'id_tipo' })
  tipo: TipoEntity;

  @OneToOne(
    () => AnexoSugestaoEntity,
    (anexoSugestao: AnexoSugestaoEntity) => anexoSugestao.anexo,
  )
  @JoinColumn({ name: 'id_sugestao_anexo' })
  anexoSugestao: AnexoSugestaoEntity;

  @ManyToOne(
    () => CaminhoServidorEntity,
    (caminhoServidor: CaminhoServidorEntity) => caminhoServidor.anexo,
  )
  @JoinColumn({ name: 'id_caminho_servidor' })
  caminhoServidor: CaminhoServidorEntity;

  @ManyToMany(() => TagEntity, (tag: TagEntity) => tag.anexo)
  @JoinTable({
    name: 'tags_anexos',
    joinColumn: { name: 'id_anexo', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_tag', referencedColumnName: 'id' },
  })
  tags: TagEntity[];

  @ManyToMany(() => GaleriaEntity, (galeria: GaleriaEntity) => galeria.anexo)
  @JoinTable({
    name: 'galerias_anexos',
    joinColumn: { name: 'id_anexo', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_galeria', referencedColumnName: 'id' },
  })
  galerias: GaleriaEntity[];
}
