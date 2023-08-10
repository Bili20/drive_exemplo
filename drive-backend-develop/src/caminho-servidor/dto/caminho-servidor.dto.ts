import { IsString } from 'class-validator';

export class CaminhoServidorDTO {
  @IsString()
  nome: string;
}
