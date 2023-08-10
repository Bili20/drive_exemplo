import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class TagDTO {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsString()
  @ApiProperty()
  @MinLength(4)
  nome: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  descricao: string;

  @Transform(
    ({ value }) =>
      (typeof value == 'string' &&
        value.toLowerCase() !== 'false' &&
        value.toLowerCase() !== 'f') ||
      (value != 0 && value !== false),
  )
  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  categoria: boolean;

  @IsNumber()
  @IsOptional()
  quantidadeAnexo: number;
}
