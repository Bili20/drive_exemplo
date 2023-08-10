import { Request } from 'express';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';

export interface AuthRequest extends Request {
  user: PessoaEntity;
}
