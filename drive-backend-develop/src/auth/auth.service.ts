import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import { PessoaService } from 'src/pessoa/services/pessoa.service';
import { UserPayload } from './models/userPayload';
import { UserToken } from './models/userToken';
import { jwtConstants } from 'src/constants/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly pessoaService: PessoaService,
  ) {}

  async login(pessoa: PessoaEntity): Promise<UserToken> {
    const payload: UserPayload = {
      sub: pessoa.id,
      email: pessoa.email,
      nome: pessoa.nome,
      grupo: pessoa.idGrupo,
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '600s' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '10d' }),
    };
  }

  async gerarNewToken(body: UserToken) {
    try {
      const payload: PessoaEntity = await this.verifyRefreshToken(body);
      const data = await this.login(payload);
      return data.access_token;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  private async verifyRefreshToken(body: UserToken) {
    const refreshToken = body.refresh_token;

    if (!refreshToken) {
      throw new NotFoundException({ message: 'Usuário não encontrado' });
    }

    const email = this.jwtService.decode(refreshToken)['email'];
    const usuario = await this.pessoaService.findPessoaForEmail(email);
    if (!usuario) {
      throw new NotFoundException({ message: 'Usuário não encontrado' });
    }

    try {
      this.jwtService.verify(refreshToken, {
        secret: jwtConstants.secret,
      });
      return usuario;
    } catch (e) {
      throw new UnauthorizedException(e.response, e.status);
    }
  }

  async validateUser(email: string, senha: string): Promise<PessoaEntity> {
    const pessoa = await this.pessoaService.findPessoaForEmail(email);

    if (pessoa) {
      const isPasswordValid = await bcrypt.compare(senha, pessoa.senha);

      if (isPasswordValid) {
        return {
          ...pessoa,
          senha: undefined,
        };
      }
    } else {
      return await this.pessoaService.authSankhya({
        usuario: pessoa ? pessoa.cpf : email,
        senha: senha,
      });
    }
    throw new UnauthorizedException({ message: 'email ou senha incorreto' });
  }
}
