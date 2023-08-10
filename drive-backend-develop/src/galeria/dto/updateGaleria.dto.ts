import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateGaleriaDTO {
  @IsString()
  @IsOptional()
  titulo: string;

  @IsBoolean()
  @IsOptional()
  publica: boolean;
}
