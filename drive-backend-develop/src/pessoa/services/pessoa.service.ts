import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PessoaEntity } from '../entities/pessoa.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { PessoaDTO } from '../dto/pessoa.dto';
import * as bcrypt from 'bcrypt';
import * as md5 from 'blueimp-md5';
import { FindPaginationDTO } from 'src/anexo/dtos/pagination.dto';
import { PessoaFactory } from '../retorno/getPessoa';
import { UsersSankhya } from '../entities/userSankhya.entity.oracle';
import { DB_ORACLE_DATABASE } from 'src/config/typeOrmConfig';
import { Cron } from '@nestjs/schedule';
import { UserSankhyaDTO } from '../dto/userSankhya.dto';
import { SincronizaEntity } from 'src/sincronizar/sincronizar.entity';

@Injectable()
export class PessoaService {
  constructor(
    @InjectRepository(PessoaEntity)
    private pessoaRepository: Repository<PessoaEntity>,
    @InjectRepository(UsersSankhya, DB_ORACLE_DATABASE)
    private userSankhyaRepository: Repository<UsersSankhya>,
    @InjectRepository(SincronizaEntity)
    private sincronizaRepository: Repository<SincronizaEntity>,
    private readonly pessoaFactory: PessoaFactory,
  ) {}

  async createUser(pessoaDTO: PessoaDTO) {
    try {
      const data = this.pessoaRepository.create(pessoaDTO);
      data.senha = await bcrypt.hash(pessoaDTO.senha, 10);

      await this.pessoaRepository.save(data);
      return true;
    } catch (e) {
      console.log(e);
      throw new BadRequestException({
        message: 'Entre em contato com o suporte',
      });
    }
  }

  async findAll({ quantidade, pagina, nome }: FindPaginationDTO) {
    try {
      nome = nome ?? '';
      const total = await this.pessoaRepository
        .createQueryBuilder('pessoa')
        .where('pessoa.nome ilike :nome', { nome: `%${nome}%` })
        .getCount();
      pagina = pagina ?? 1;
      quantidade = quantidade ?? 10;
      const totalPage = Math.ceil(total / quantidade);

      const user = await this.pessoaRepository
        .createQueryBuilder('pessoa')
        .leftJoinAndSelect('pessoa.grupo', 'grupo')
        .where('pessoa.nome ilike :nome', { nome: `%${nome}%` })
        .take(quantidade)
        .skip((pagina - 1) * quantidade)
        .getMany();
      const estrutura = await this.pessoaFactory.pessoaMulti(user);

      return { totalPage, estrutura };
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async findPessoasGrupo(
    pessoa: PessoaEntity,
    { pagina, quantidade, nome }: FindPaginationDTO,
  ) {
    nome = nome ?? '';
    const total = await this.pessoaRepository
      .createQueryBuilder('pessoa')
      .where('pessoa.idGrupo = :user and pessoa.nome ilike :nome', {
        user: pessoa.grupo,
        nome: `%${nome}%`,
      })
      .getCount();
    pagina = pagina ?? 1;
    quantidade = quantidade ?? 10;
    const totalPage = Math.ceil(total / quantidade);

    const users = await this.pessoaRepository
      .createQueryBuilder('pessoa')
      .innerJoinAndSelect('pessoa.grupo', 'grupo')
      .where('pessoa.idGrupo = :user and pessoa.nome ilike :nome', {
        user: pessoa.grupo,
        nome: `%${nome}%`,
      })
      .take(quantidade)
      .skip((pagina - 1) * quantidade)
      .getMany();
    const estrutura = await this.pessoaFactory.pessoaMulti(users);

    return { totalPage, estrutura };
  }

  async findUser(pessoa: PessoaEntity) {
    const data = await this.pessoaRepository.findOne({
      where: { id: pessoa.id },
      select: ['id', 'email', 'nome', 'idGrupo'],
    });
    return data;
  }

  async adicionaPessoaGrupo(idUser: number, idgrupo: number) {
    try {
      const user = await this.pessoaRepository.findOne({
        where: { id: idUser },
      });
      user.idGrupo = idgrupo;

      await this.pessoaRepository.save(user);
      return true;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async removePessoaGrupo(idUser: number, pessoa: PessoaEntity) {
    try {
      const user = await this.pessoaRepository
        .createQueryBuilder('pessoa')
        .where('pessoa.idGrupo = :user and pessoa.id = :iduser', {
          user: pessoa.grupo,
          iduser: idUser,
        })
        .getOne();

      if (!user) {
        throw new UnauthorizedException();
      }
      user.idGrupo = null;
      await this.pessoaRepository.save(user);
      return true;
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  async findPessoaForEmail(email: string) {
    const data = await this.pessoaRepository.findOne({
      where: { email: email },
    });
    return data;
  }

  async findUserShankhya(usuario: string) {
    const userSankhya = await this.userSankhyaRepository
      .createQueryBuilder('user')
      .where('(Ativo = :status1 OR Ativo = :status2)', {
        status1: 'ATIVO',
        status2: 'AFASTADO/APOSENTADO',
      })
      .andWhere('Cpf = :usuario OR lower(Email) = lower(:usuario)', {
        usuario: usuario,
      })
      .orderBy('DATA_ALTERACAO', 'DESC')
      .getOne();

    return userSankhya;
  }

  async authSankhya({ usuario, senha }: UserSankhyaDTO): Promise<PessoaEntity> {
    const userSankhya = await this.findUserShankhya(usuario);

    if (!userSankhya) {
      throw new ForbiddenException(
        'Usuário não encontrado, entre em contato com o suporte.',
      );
    }
    const senhaCriptografada = md5(userSankhya.Usuario + senha);
    if (senhaCriptografada != userSankhya.Senha) {
      throw new ForbiddenException(
        'Usuário não encontrado, entre em contato com o suporte.',
      );
    }
    try {
      const usuarioDrive = await this.findByCpf(userSankhya.Cpf);
      return usuarioDrive;
    } catch (e) {
      throw new ForbiddenException(
        'Usuário não encontrado, entre em contato com o suporte.',
      );
    }
  }

  private async findByCpf(cpf: string) {
    const pessoa = await this.pessoaRepository.findOne({ where: { cpf: cpf } });
    return pessoa;
  }

  async saveUser(user: UsersSankhya) {
    let pessoa = await this.findByCpf(user.Cpf);
    pessoa = pessoa ?? new PessoaEntity();

    pessoa.nome = user.Nome;
    pessoa.cpf = user.Cpf;
    pessoa.email = user.Email;
    pessoa.senha = null;

    await this.pessoaRepository.save(pessoa);
  }

  @Cron('00 */15 * * * *')
  async sincrinizaSankhya() {
    try {
      const sincro = await this.sincronizaRepository.findOne({
        where: { tipo: 'sankhya' },
      });
      const sankhya = await this.userSankhyaRepository.find({
        where: {
          DataAlteracao: MoreThanOrEqual(new Date(sincro.datSincronizado)),
        },
        order: {
          DataAlteracao: 'ASC',
        },
      });
      if (sankhya.length > 0) {
        for (const data of sankhya) {
          await this.saveUser(data);
        }
      }
      sincro.datSincronizado = new Date();
      await this.sincronizaRepository.save(sincro);
    } catch (e) {
      console.log(e);
    }
  }
}
