import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class PlataformaDTO {
  @IsString()
  @IsOptional()
  @ApiProperty()
  url: string;

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

  @IsString()
  @IsOptional()
  nomeOriginal: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  @Type(() => Number)
  idcaminho: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  capa: string;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => value.split(','))
  @ApiProperty()
  tags: number[];
}
