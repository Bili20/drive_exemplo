import { IsOptional } from 'class-validator';
import { AnexoDTO } from './anexo.dto';

export class UpdateAnexoDTO extends AnexoDTO {
  @IsOptional()
  titulo: string;

  @IsOptional()
  idcaminho: number;
}
