import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { GrupoService } from '../services/grupo.service';
import { GrupoDTO } from '../dto/grupo.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Grupos } from 'src/auth/enum/grupo.enum';
@ApiTags('Grupo')
@Roles(Grupos.MARKETING)
@Controller('grupo')
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Post('create')
  createGrupo(@Body() grupoDTO: GrupoDTO) {
    return this.grupoService.createGrupo(grupoDTO);
  }

  @Patch(':id/update')
  updateGrupo(@Param('id') id: number, @Body() grupoDTO: GrupoDTO) {
    return this.grupoService.updateGrupo(id, grupoDTO);
  }

  @Delete(':id/destroy')
  destroyGrupo(@Param('id') id: number) {
    this.grupoService.destroyGrupo(id);
    return true;
  }
}
