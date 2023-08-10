import { Controller, Get } from '@nestjs/common';
import { CaminhoServidorService } from '../services/caminho-servicor.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Caminho Servidor')
@Controller('caminhoServidor')
export class CaminhoServidorController {
  constructor(private readonly caminhoService: CaminhoServidorService) {}

  /*   @Post()
  createFolderServidor() {
    return this.caminhoService.createFolderServer();
  } */

  @Get()
  findFolderServer() {
    return this.caminhoService.findFolderServer();
  }
}
