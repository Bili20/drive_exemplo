import { IsEmail, IsString } from 'class-validator';

export class LoginRequestBody {
  @IsString()
  email: string;

  @IsString()
  senha: string;
}
