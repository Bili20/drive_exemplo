import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import { AuthRequest } from '../models/authRequest';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): PessoaEntity => {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    return request.user;
  },
);
