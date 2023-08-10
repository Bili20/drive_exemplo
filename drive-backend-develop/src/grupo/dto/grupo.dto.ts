import { IsString } from 'class-validator';

export class GrupoDTO {
  @IsString()
  nome: string;
}
