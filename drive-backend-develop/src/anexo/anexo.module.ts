import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnexoSugestaoEntity } from 'src/anexo-sugestao/entities/anexoSugestao.entity';
import { TagEntity } from 'src/tag/entities/tag.entity';
import { AnexoController } from './controllers/anexo.controller';
import { ArquivoController } from './controllers/arquivo.controller';
import { PlataformaController } from './controllers/plataforma.controller';
import { TipoController } from './controllers/tipo.controller';
import { AnexoEntity } from './entities/anexo.entity';
import { ArquivoEntity } from './entities/arquivo.entity';
import { PlataformaEntity } from './entities/plataforma.entity';
import { TipoEntity } from './entities/tipo.entity';
import { AnexoService } from './services/anexo.service';
import { ArquivoService } from './services/arquivo.service';
import { PlataformaService } from './services/plataforma.service';
import { TipoService } from './services/tipo.service';
import { CaminhoServidorEntity } from 'src/caminho-servidor/entities/caminho-servidor.entity';
import { CaminhoServidorService } from 'src/caminho-servidor/services/caminho-servicor.service';
import { getAnexoFactory } from './retornos/getAnexo';
import { GaleriaEntity } from 'src/galeria/entities/galeria.entity';
import { getAnexoFactoryLixeira } from './retornos/getAnexoLixeira';
import { GaleriaService } from 'src/galeria/services/galeria.service';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnexoEntity,
      ArquivoEntity,
      AnexoSugestaoEntity,
      TipoEntity,
      PlataformaEntity,
      TagEntity,
      GaleriaEntity,
      PessoaEntity,
      CaminhoServidorEntity,
    ]),
  ],
  providers: [
    AnexoService,
    ArquivoService,
    TipoService,
    PlataformaService,
    GaleriaService,
    CaminhoServidorService,
    getAnexoFactory,
    getAnexoFactoryLixeira,
  ],
  controllers: [
    AnexoController,
    ArquivoController,
    TipoController,
    PlataformaController,
  ],
})
export class AnexoModule {}
