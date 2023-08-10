import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaminhoServidorEntity } from './entities/caminho-servidor.entity';
import { CaminhoServidorService } from './services/caminho-servicor.service';
import { CaminhoServidorController } from './controllers/caminho-servidor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CaminhoServidorEntity])],
  providers: [CaminhoServidorService],
  controllers: [CaminhoServidorController],
  exports: [CaminhoServidorService],
})
export class CaminhoServidorModule {}
