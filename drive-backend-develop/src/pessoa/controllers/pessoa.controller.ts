import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PessoaService } from '../services/pessoa.service';
import { PessoaDTO } from '../dto/pessoa.dto';
import { IsPublic } from 'src/auth/decorators/isPublic';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/currentUser';
import { PessoaEntity } from '../entities/pessoa.entity';
import { FindPaginationDTO } from 'src/anexo/dtos/pagination.dto';
@ApiTags('Pessoa')
@Controller('pessoa')
export class PessoaController {
  constructor(private pessoaService: PessoaService) {}

  @Get('all')
  findAll(@Query() query: FindPaginationDTO) {
    return this.pessoaService.findAll(query);
  }

  @Get('grupo')
  findPessoasGrupo(
    @CurrentUser() pessoa: PessoaEntity,
    @Query() query: FindPaginationDTO,
  ) {
    return this.pessoaService.findPessoasGrupo(pessoa, query);
  }

  @Get('user')
  findUser(@CurrentUser() pessoa: PessoaEntity) {
    return this.pessoaService.findUser(pessoa);
  }

  @Post(':idUser/grupo/:idGrupo')
  adicionaPessoaGrupo(
    @Param('idUser') idUser: number,
    @Param('idGrupo') idGrupo: number,
  ) {
    return this.pessoaService.adicionaPessoaGrupo(idUser, idGrupo);
  }

  @Post(':idUser/grupo')
  removePessoaGrupo(
    @Param('idUser') idUser: number,
    @CurrentUser() pessoa: PessoaEntity,
  ) {
    return this.pessoaService.removePessoaGrupo(idUser, pessoa);
  }

  @IsPublic()
  @Post('create')
  createUser(@Body() pessoaDTO: PessoaDTO) {
    return this.pessoaService.createUser(pessoaDTO);
  }
}
