import { SetMetadata } from '@nestjs/common';
import { Grupos } from '../enum/grupo.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: number[]) => SetMetadata(ROLES_KEY, roles);
