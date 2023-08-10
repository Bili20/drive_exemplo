import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FindPaginationDTO } from 'src/anexo/dtos/pagination.dto';
import { CurrentUser } from 'src/auth/decorators/currentUser';
import { IsPublic } from 'src/auth/decorators/isPublic';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import { GaleriaDTO } from '../dto/galeria.dto';
import { UpdateGaleriaDTO } from '../dto/updateGaleria.dto';
import { GaleriaService } from '../services/galeria.service';

@ApiTags('Galeria')
@Controller('galeria')
export class GaleriaController {
  constructor(private readonly galeriaService: GaleriaService) {}

  @Post('create')
  createGaleria(
    @CurrentUser() pessoa: PessoaEntity,
    @Body() galeriaDTO: GaleriaDTO,
  ) {
    return this.galeriaService.createGaleria(pessoa, galeriaDTO);
  }

  @IsPublic()
  @ApiOkResponse({ description: 'busca todas as galerias publicas' })
  @Get('/pagina')
  findGaleriaPublicaAndPrivada(
    @CurrentUser() pessoa: any,
    @Query() query: FindPaginationDTO,
  ) {
    if (pessoa === undefined)
      return this.galeriaService.findGaleriaPublicaAndPrivada(0, query);

    return this.galeriaService.findGaleriaPublicaAndPrivada(pessoa.sub, query);
  }

  @IsPublic()
  @Get(':hash/valida/pessoa')
  validaPessoaGaleria(@CurrentUser() pessoa: any, @Param('hash') hash: string) {
    if (pessoa == undefined)
      return this.galeriaService.validaPessoaGaleria(0, hash);

    return this.galeriaService.validaPessoaGaleria(pessoa.sub, hash);
  }

  @Get('usuario/pagina')
  findGaleriaUsuario(
    @CurrentUser() pessoa: PessoaEntity,
    @Query() query: FindPaginationDTO,
  ) {
    return this.galeriaService.findGaleriaUsuario(pessoa, query);
  }

  @IsPublic()
  @Get(':hash')
  findOneForhash(@Param('hash') hash: string) {
    return this.galeriaService.findOneForhash(hash);
  }

  @Get('publica/pagina')
  findGaleriaPublica(@Query() query: FindPaginationDTO) {
    return this.galeriaService.findGaleriaPublica(query);
  }

  @ApiOkResponse({ description: 'busca a galeria favorito do usuario' })
  @Get('favorito')
  findGaleriaFavorita(@CurrentUser() pessoa: PessoaEntity) {
    return this.galeriaService.findGaleriaFavorita(pessoa);
  }

  @Patch('update/:hash')
  updateGaleria(
    @Param('hash') hash: string,
    @CurrentUser() pessoa: PessoaEntity,
    @Body() galeriaDTO: UpdateGaleriaDTO,
  ) {
    return this.galeriaService.updateGaleria(hash, pessoa, galeriaDTO);
  }

  @ApiOkResponse({
    description: 'delete uma galeria do usuario que esta logado',
  })
  @Delete('destroy/:id')
  destroyGaleria(@Param('id') id: number, @CurrentUser() pessoa: PessoaEntity) {
    return this.galeriaService.destroyGaleria(id, pessoa);
  }
}
