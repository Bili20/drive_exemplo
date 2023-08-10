import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, mkdirSync } from 'fs';
import { FOLDER_STORAGE } from 'src/constants/constants';
import { Repository } from 'typeorm';
import { CaminhoServidorDTO } from '../dto/caminho-servidor.dto';
import { CaminhoServidorEntity } from '../entities/caminho-servidor.entity';

@Injectable()
export class CaminhoServidorService {
  constructor(
    @InjectRepository(CaminhoServidorEntity)
    private caminhoRepository: Repository<CaminhoServidorEntity>,
  ) {}
  async findFolderServer() {
    const caminho = await this.caminhoRepository
      .createQueryBuilder('caminho')
      .where("caminho.nome = to_char(NOW(), 'yyyy/mm')")
      .getOne();

    if (!caminho) {
      const data = await this.createFolderServer();
      return data;
    } else {
      return caminho;
    }
  }

  private async createFolderServer(caminhoDTO?: CaminhoServidorDTO) {
    const caminho = this.caminhoRepository.create(caminhoDTO);

    const data =
      new Date().getFullYear() +
      '/' +
      String(new Date().getMonth() + 1).padStart(2, '0');
    caminho.nome = data;
    await this.caminhoRepository.save(caminho);
    return caminho;
  }

  static async folder() {
    const path =
      FOLDER_STORAGE +
      new Date().getFullYear() +
      '/' +
      String(new Date().getMonth() + 1).padStart(2, '0');
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }

    return path;
  }
  static async pathFile(name: string) {
    const data = await this.folder();
    const teste = data + '/' + name;
    return teste;
  }
}
