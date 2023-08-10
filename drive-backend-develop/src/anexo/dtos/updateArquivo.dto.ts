import { IsArray, IsOptional } from 'class-validator';
import { ArquivoDTO } from './arquivo.dto';
import { Transform } from 'class-transformer';

export class UpdateArquivoDTO extends ArquivoDTO {
  @IsOptional()
  titulo: string;
}
