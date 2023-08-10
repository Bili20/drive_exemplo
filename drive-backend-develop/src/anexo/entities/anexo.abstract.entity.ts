import { Column, DeleteDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class AnexoAbstract {
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
  nome: string;

  @Column({ name: 'nome_original' })
  nomeOriginal: string;

  @Column()
  descricao: string;

  @Column({ name: 'id_tipo' })
  idTipo: number;

  @Column({ name: 'id_caminho_servidor' })
  idCaminhoServidor: number;

  @Column({ name: 'id_sugestao_anexo' })
  idSugestao: number;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleteAt: Date;
}
