import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GaleriaEntity } from './entities/galeria.entity';
import { GaleriaService } from './services/galeria.service';
import { GaleriaController } from './controllers/galeria.controller';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GaleriaEntity, PessoaEntity])],
  providers: [GaleriaService],
  controllers: [GaleriaController],
})
export class GaleriaModule {}
