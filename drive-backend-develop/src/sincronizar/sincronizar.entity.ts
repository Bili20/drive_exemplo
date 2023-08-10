import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sincronizar')
export class SincronizaEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'data_sincronizado' })
  datSincronizado: Date;

  @Column()
  tipo: string;
}
