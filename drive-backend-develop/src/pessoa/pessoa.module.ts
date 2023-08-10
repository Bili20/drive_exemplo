import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PessoaService } from './services/pessoa.service';
import { PessoaController } from './controllers/pessoa.controller';
import { PessoaEntity } from './entities/pessoa.entity';
import { PessoaFactory } from './retorno/getPessoa';
import { UsersSankhya } from './entities/userSankhya.entity.oracle';
import { DB_ORACLE_DATABASE } from 'src/config/typeOrmConfig';
import { SincronizaEntity } from 'src/sincronizar/sincronizar.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PessoaEntity, SincronizaEntity]),
    TypeOrmModule.forFeature([UsersSankhya], DB_ORACLE_DATABASE),
  ],

  providers: [PessoaService, PessoaFactory],
  controllers: [PessoaController],
  exports: [PessoaService],
})
export class PessoaModule {}
