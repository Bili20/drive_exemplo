import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ArquivoDTO {
  @IsString()
  @ApiProperty()
  titulo: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  descricao: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  nome: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  idcaminho: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  nomeOriginal: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  capa: string;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => value.split(','))
  tags: number[];
}
