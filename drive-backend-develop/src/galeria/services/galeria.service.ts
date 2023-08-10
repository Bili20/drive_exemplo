import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GaleriaDTO } from '../dto/galeria.dto';
import { GaleriaEntity } from '../entities/galeria.entity';
import { Repository } from 'typeorm';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import { FindPaginationDTO } from 'src/anexo/dtos/pagination.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateGaleriaDTO } from '../dto/updateGaleria.dto';
import { CurrentUser } from 'src/auth/decorators/currentUser';

@Injectable()
export class GaleriaService {
  constructor(
    @InjectRepository(GaleriaEntity)
    private readonly galeriaRepository: Repository<GaleriaEntity>,
    @InjectRepository(PessoaEntity)
    private readonly pessoaRepository: Repository<PessoaEntity>,
  ) {}

  async createGaleria(pessoa: PessoaEntity, galeriaDTO: GaleriaDTO) {
    try {
      const user = await this.pessoaRepository.findOne({
        where: { id: pessoa.id },
      });
      const newGaleria = new GaleriaEntity();
      newGaleria.titulo = galeriaDTO.titulo;
      newGaleria.publica = galeriaDTO.publica;
      newGaleria.hash = uuidv4();
      newGaleria.idPessoa = user.id;
      if (user.idGrupo) {
        newGaleria.idGrupo = user.idGrupo;
      }
      const galeria = await this.galeriaRepository.save(newGaleria);
      return galeria;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async findGaleriaPublicaAndPrivada(
    idPessoa: number,
    { pagina, quantidade, nome }: FindPaginationDTO,
  ) {
    pagina = pagina ?? 1;
    quantidade = quantidade ?? 10;
    nome = nome ?? '';
    let galeria: GaleriaEntity[] = [];

    if (idPessoa) {
      galeria = await this.galeriaRepository.find({
        where: { idPessoa: idPessoa, publica: false },
      });
    }
    const galeriaPublica = await this.galeriaRepository
      .createQueryBuilder('galeria')
      .where(`galeria.publica = true and galeria.titulo ilike :titulo`, {
        titulo: `%${nome}%`,
      })
      .orderBy('galeria.id', 'DESC')
      .take(quantidade)
      .skip((pagina - 1) * quantidade)
      .getMany();

    galeria = [...galeria, ...galeriaPublica];

    return galeria;
  }

  async findGaleriaFavorita(pessoa: PessoaEntity) {
    const galeria = await this.galeriaRepository.findOne({
      where: { idPessoa: pessoa.id, favorito: true },
    });
    return galeria;
  }

  async findOneGaleria(id: number) {
    const galeria = await this.galeriaRepository.findOne({ where: { id: id } });
    return galeria;
  }

  async findOneForhash(hash: string) {
    const galeria = await this.galeriaRepository.findOne({
      where: { hash: hash },
    });
    if (!galeria) {
      throw new BadRequestException();
    }
    return galeria;
  }

  async validaPessoaGaleria(pessoa: number, hash: string) {
    const galeria = await this.galeriaRepository.findOne({
      where: { hash: hash },
    });
    if (!pessoa) {
      if (galeria.publica == true) {
        return true;
      } else {
        throw new ForbiddenException();
      }
    }
    if (pessoa) {
      if (pessoa == galeria.idPessoa || galeria.publica == true) {
        return true;
      } else {
        throw new ForbiddenException();
      }
    }
  }

  async findGaleriaUsuario(
    pessoa: PessoaEntity,
    { pagina, quantidade, nome }: FindPaginationDTO,
  ) {
    pagina = pagina ?? 1;
    quantidade = quantidade ?? 10;
    nome = nome ?? '';
    const total = await this.galeriaRepository
      .createQueryBuilder('galeria')
      .where('galeria.id_pessoa = :id and galeria.titulo ilike :nome', {
        id: pessoa.id,
        nome: `%${nome}%`,
      })
      .getManyAndCount();
    const totalPage = Math.ceil(total[1] / quantidade);

    const galeria = await this.galeriaRepository
      .createQueryBuilder('galeria')
      .where('galeria.id_pessoa = :id and galeria.titulo ilike :nome', {
        id: pessoa.id,
        nome: `%${nome}%`,
      })
      .orderBy('galeria.id', 'DESC')
      .take(quantidade)
      .skip((pagina - 1) * quantidade)
      .getMany();

    return { totalPage, galeria };
  }

  async findGaleriaPublica({ pagina, quantidade, nome }: FindPaginationDTO) {
    pagina = pagina ?? 1;
    quantidade = quantidade ?? 10;
    nome = nome ?? '';
    const total = await this.galeriaRepository
      .createQueryBuilder('galeria')
      .where('galeria.publica = true and galeria.titulo ilike :nome', {
        nome: `%${nome}%`,
      })
      .getManyAndCount();
    const totalPage = Math.ceil(total[1] / quantidade);

    const galeria = await this.galeriaRepository
      .createQueryBuilder('galeria')
      .where('galeria.publica = true and galeria.titulo ilike :nome', {
        nome: `%${nome}%`,
      })
      .orderBy('galeria.id', 'DESC')
      .take(quantidade)
      .skip((pagina - 1) * quantidade)
      .getMany();

    return { totalPage, galeria };
  }

  async updateGaleria(
    hash: string,
    pessoa: PessoaEntity,
    galeriaDTO: UpdateGaleriaDTO,
  ) {
    try {
      const galeria = await this.galeriaRepository.findOne({
        where: { hash: hash, idPessoa: pessoa.id },
      });

      await this.galeriaRepository.update(galeria.id, galeriaDTO);
      return true;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async destroyGaleria(id: number, pessoa: PessoaEntity) {
    const galeria = await this.galeriaRepository.findOne({
      where: { id: id, idPessoa: pessoa.id, favorito: false },
    });
    if (!galeria) {
      throw new NotFoundException({ message: 'Galeria não encontrada' });
    }

    await this.galeriaRepository.delete(id);
    return true;
  }

  async findNameAndPublicOfGaleria(hash: string) {
    const galeria = await this.galeriaRepository.findOne({
      where: { hash: hash },
    });
    const titulo = galeria.titulo;
    const publica = galeria.publica;
    return { titulo, publica };
  }
}
