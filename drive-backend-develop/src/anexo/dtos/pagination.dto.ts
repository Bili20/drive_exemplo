import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { stringToNumberArray } from 'src/customDecorators/transformerStringToNumberArray';

export class FindPaginationDTO {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  data: Date;

  @IsOptional()
  @Transform(({ value }) => stringToNumberArray(value.toString()))
  paramId: number[];

  @IsOptional()
  @IsString()
  nome: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quantidade: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pagina: number;
}
