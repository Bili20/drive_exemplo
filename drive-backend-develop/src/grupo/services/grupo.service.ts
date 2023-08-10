import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { GrupoEntity } from '../entities/grupo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GrupoDTO } from '../dto/grupo.dto';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(GrupoEntity)
    private readonly grupoRepository: Repository<GrupoEntity>,
  ) {}

  async createGrupo(grupoDTO: GrupoDTO) {
    try {
      const data = await this.grupoRepository.save(grupoDTO);
      return data;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async findGrupo() {
    const grupo = await this.grupoRepository.find();
    return grupo;
  }

  async updateGrupo(id: number, grupoDTO: GrupoDTO) {
    try {
      const data = await this.grupoRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!data) {
        throw new NotFoundException({ message: 'Grupo não encotrado' });
      }
      await this.grupoRepository.update(id, grupoDTO);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async destroyGrupo(id: number) {
    try {
      const data = await this.grupoRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!data) {
        throw new NotFoundException({ message: 'Grupo não encotrado' });
      }
      await this.grupoRepository.delete(id);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }
}
