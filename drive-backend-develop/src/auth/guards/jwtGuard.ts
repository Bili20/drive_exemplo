import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { jwtConstants } from 'src/constants/constants';
import { IS_PUBLIC_KEY } from '../decorators/isPublic';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector, private jwtService: JwtService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    try {
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization;
      if (token && token != 'Bearer') {
        const decoded = this.jwtService.verify(token.replace('Bearer ', ''), {
          secret: jwtConstants.secret,
        });

        const timeAtual = new Date().getTime() / 1000;

        if (timeAtual <= decoded.exp) {
          request.user = decoded;
        }
      }

      if (isPublic) {
        return true;
      }
      return super.canActivate(context);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
