import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SugestaoDTO {
  @IsString()
  @IsOptional()
  @ApiProperty()
  nome: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  capa: string;

  @ApiProperty()
  @IsString()
  titulo: string;

  @IsString()
  @IsOptional()
  nomeOriginal: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  descricao: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  idTipo: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  idPessoa: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  idcaminho: number;
}
