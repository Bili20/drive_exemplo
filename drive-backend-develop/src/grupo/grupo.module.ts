import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoEntity } from './entities/grupo.entity';
import { GrupoService } from './services/grupo.service';
import { GrupoController } from './controllers/grupo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GrupoEntity])],
  providers: [GrupoService],
  controllers: [GrupoController],
})
export class GrupoModule {}
