import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Grupos } from '../enum/grupo.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requirdRoles = this.reflector.getAllAndOverride<Grupos[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requirdRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requirdRoles.some((grupo) => user.grupo == grupo);
  }
}
