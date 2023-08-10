import { IsEmpty, IsOptional } from 'class-validator';
import { PlataformaDTO } from './plataforma.dto';
import { Type } from 'class-transformer';

export class UpdatePlataformaDTO extends PlataformaDTO {
  @IsOptional()
  titulo: string;

  @IsOptional()
  url: string;

  @IsEmpty()
  idCaminho: number;
}
