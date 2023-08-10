import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequest } from './models/authRequest';
import { IsPublic } from './decorators/isPublic';
import { LocalAuthGuard } from './guards/localGuard';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import { UserToken } from './models/userToken';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './decorators/currentUser';
@ApiTags('Login')
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: AuthRequest) {
    return this.authService.login(req.user);
  }

  @IsPublic()
  @Post('refresh')
  async(@Body() body: UserToken) {
    return this.authService.gerarNewToken(body);
  }
}
