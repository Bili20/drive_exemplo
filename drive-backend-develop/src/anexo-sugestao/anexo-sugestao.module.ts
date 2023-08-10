import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnexoSugestaoEntity } from './entities/anexoSugestao.entity';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import { AnexoSugestaoController } from './controllers/anexo-sugestao.controller';
import { AnexoSugestaoService } from './services/anexo-sugestao.service';
import { CaminhoServidorService } from 'src/caminho-servidor/services/caminho-servicor.service';
import { CaminhoServidorEntity } from 'src/caminho-servidor/entities/caminho-servidor.entity';
import { TipoEntity } from 'src/anexo/entities/tipo.entity';
import { getSugestaoFactory } from './retorno/getSugestao';
import { AnexoEntity } from 'src/anexo/entities/anexo.entity';
import { getAnexoFactory } from 'src/anexo/retornos/getAnexo';
import { ArquivoEntity } from 'src/anexo/entities/arquivo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnexoSugestaoEntity,
      PessoaEntity,
      AnexoEntity,
      CaminhoServidorEntity,
      TipoEntity,
    ]),
  ],
  providers: [AnexoSugestaoService, CaminhoServidorService, getSugestaoFactory],
  controllers: [AnexoSugestaoController],
})
export class AnexoSugestaoModule {}
