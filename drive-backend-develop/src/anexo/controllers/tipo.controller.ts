import { Controller, Get } from '@nestjs/common';
import { TipoService } from '../services/tipo.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Tipo')
@Controller('tipo')
export class TipoController {
  constructor(private readonly tipoService: TipoService) {}

  @Get()
  findAllTipo() {
    return this.tipoService.findAllTipo();
  }
}
