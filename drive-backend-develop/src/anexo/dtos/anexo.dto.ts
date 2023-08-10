import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class AnexoDTO {
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
  @ApiProperty()
  nomeOriginal: string;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty()
  idcaminho: number;

  @IsArray()
  @IsOptional()
  @ApiProperty()
  @Transform(({ value }) => value.split(','))
  tags: number[];
}
