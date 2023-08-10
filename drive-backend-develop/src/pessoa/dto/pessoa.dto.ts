import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  maxLength,
} from 'class-validator';

export class PessoaDTO {
  @IsString()
  @ApiProperty()
  nome: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  senha: string;

  @IsString()
  @ApiProperty()
  @MaxLength(11)
  cpf: string;

  @IsOptional()
  @ApiProperty()
  user: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  idGrupo: number;
}
