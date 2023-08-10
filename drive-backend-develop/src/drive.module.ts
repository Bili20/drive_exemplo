import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig, typeOrmConfigOracle } from './config/typeOrmConfig';
import { AnexoModule } from './anexo/anexo.module';
import { CaminhoServidorModule } from './caminho-servidor/caminho-servidor.module';
import { TagModule } from './tag/tag.module';
import { PessoaModule } from './pessoa/pessoa.module';
import { GaleriaModule } from './galeria/galeria.module';
import { GrupoModule } from './grupo/grupo.module';
import { AnexoSugestaoModule } from './anexo-sugestao/anexo-sugestao.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwtGuard';
import { RolesGuard } from './auth/guards/rolesGuard';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forRoot(typeOrmConfigOracle),
    ScheduleModule.forRoot(),
    AnexoModule,
    AnexoSugestaoModule,
    CaminhoServidorModule,
    TagModule,
    PessoaModule,
    GaleriaModule,
    GrupoModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class DriveModule {}
