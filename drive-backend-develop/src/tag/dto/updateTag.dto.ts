import { IsOptional, IsString } from 'class-validator';
import { TagDTO } from './tag.dto';

export class UpdateTagDTO extends TagDTO {
  @IsString()
  @IsOptional()
  nome: string;
}
