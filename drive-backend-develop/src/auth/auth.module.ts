import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PessoaModule } from 'src/pessoa/pessoa.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './jwt-strategy/localStrategy';
import { JwtStrategy } from './jwt-strategy/jwtStrategy';
import { jwtConstants } from 'src/constants/constants';
@Module({
  imports: [
    PessoaModule,
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
