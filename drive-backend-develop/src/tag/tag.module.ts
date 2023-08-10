import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagEntity } from './entities/tag.entity';
import { AnexoEntity } from 'src/anexo/entities/anexo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TagEntity, AnexoEntity])],
  providers: [TagService],
  controllers: [TagController],
})
export class TagModule {}
