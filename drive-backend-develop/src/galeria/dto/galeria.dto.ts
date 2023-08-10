import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GaleriaDTO {
  @IsString()
  titulo: string;

  @IsBoolean()
  publica: boolean;

  @IsBoolean()
  @IsOptional()
  favorito: boolean;
}
