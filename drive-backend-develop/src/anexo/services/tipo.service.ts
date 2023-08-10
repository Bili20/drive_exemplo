import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoEntity } from '../entities/tipo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TipoService {
  constructor(
    @InjectRepository(TipoEntity)
    private readonly tipoRepository: Repository<TipoEntity>,
  ) {}

  async findAllTipo() {
    const data = await this.tipoRepository.find();
    return data;
  }
}
