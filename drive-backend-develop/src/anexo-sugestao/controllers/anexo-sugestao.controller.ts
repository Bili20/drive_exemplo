import {
  DiskStorageFile,
  FileFieldsInterceptor,
  UploadedFiles,
} from '@blazity/nest-file-fastify';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Query,
  UnprocessableEntityException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { existsSync } from 'fs';
import { FindPaginationDTO } from 'src/anexo/dtos/pagination.dto';
import { CurrentUser } from 'src/auth/decorators/currentUser';
import { CaminhoServidorService } from 'src/caminho-servidor/services/caminho-servicor.service';
import {
  IMAGE_TYPE,
  QUANTIDADE_UPLOAD,
  SUGESTAO_TYPE,
  UNLINKASYNC,
} from 'src/constants/constants';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import { SugestaoDTO } from '../dto/sugestao.dto';
import { AnexoSugestaoService } from '../services/anexo-sugestao.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Grupos } from 'src/auth/enum/grupo.enum';

@ApiTags('Sugestao')
@Controller('sugestao')
export class AnexoSugestaoController {
  constructor(
    private readonly sugestaoService: AnexoSugestaoService,
    private caminhoService: CaminhoServidorService,
  ) {}

  @ApiQuery({
    name: 'filter',
    required: false,
    content: {
      'application/query': {
        schema: {
          type: 'object',
          properties: {
            pagina: { type: 'number', default: 1 },
            quantidade: { type: 'number', default: 10 },
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Busca todas as sugestoes não aprovadas',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          descricao: { type: 'string' },
          file: { type: 'string' },
          aprovado: { type: 'boolean' },
          nome: { type: 'string' },
          tipo: { type: 'string' },
        },
      },
    },
  })
  @Get('pagina')
  findAllSugestao(@Query() query: FindPaginationDTO) {
    return this.sugestaoService.findAllSugestao(query);
  }

  @ApiQuery({
    name: 'filter',
    required: false,
    content: {
      'application/query': {
        schema: {
          type: 'object',
          properties: {
            pagina: { type: 'number', default: 1 },
            quantidade: { type: 'number', default: 10 },
            paramId: { type: 'number', default: [1, 2, 3] },
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Busca as sugestoes por tipo',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          descricao: { type: 'string' },
          file: { type: 'string' },
          aprovado: { type: 'boolean' },
          nome: { type: 'string' },
          tipo: { type: 'string' },
        },
      },
    },
  })
  @Get('pagina/tipo')
  findForTipo(@Query() query: FindPaginationDTO) {
    return this.sugestaoService.findForTipo(query);
  }

  @ApiQuery({
    name: 'filter',
    required: false,
    content: {
      'application/query': {
        schema: {
          type: 'object',
          properties: {
            pagina: { type: 'number', default: 1 },
            quantidade: { type: 'number', default: 10 },
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Busca as sugestoes do usuario logado',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          descricao: { type: 'string' },
          file: { type: 'string' },
          aprovado: { type: 'boolean' },
          nome: { type: 'string' },
          tipo: { type: 'string' },
        },
      },
    },
  })
  @Get('pagina/user')
  findSugestaoUser(
    @CurrentUser() pessoa: PessoaEntity,
    @Query() query: FindPaginationDTO,
  ) {
    return this.sugestaoService.findSugestaoUser(pessoa, query);
  }

  @ApiConsumes('multipart/form-data')
  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: QUANTIDADE_UPLOAD },
        { name: 'capa', maxCount: 1 },
      ],
      {
        dest: CaminhoServidorService.folder(),
      },
    ),
  )
  async createSugestao(
    @UploadedFiles()
    files: { file: DiskStorageFile[]; capa: DiskStorageFile[] },
    @CurrentUser() pessoa: PessoaEntity,
    @Body() sugestaoDTO: SugestaoDTO,
  ) {
    try {
      const folderServer = await this.caminhoService.findFolderServer();

      for (const sugestaoFile of files.file) {
        if (!SUGESTAO_TYPE.test(sugestaoFile.mimetype)) {
          throw new UnprocessableEntityException({
            message: 'Tipo de arquivo inválido.',
          });
        }

        sugestaoDTO.nome = sugestaoFile.filename;
        sugestaoDTO.nomeOriginal = sugestaoFile.originalFilename;
        sugestaoDTO.idcaminho = folderServer.id;
        sugestaoDTO.idPessoa = pessoa.id;

        if (files.capa) {
          for (const sugestaoCapa of files.capa) {
            if (!IMAGE_TYPE.test(sugestaoCapa.mimetype)) {
              throw new UnprocessableEntityException({
                message: 'Tipo de arquivo inválido.',
              });
            }
            sugestaoDTO.capa = sugestaoCapa.filename;
          }
        }
        this.sugestaoService.createSugestao(sugestaoDTO);
      }

      return true;
    } catch (e) {
      if (files.file) {
        for (const nome of files.file) {
          if (
            existsSync(await CaminhoServidorService.pathFile(nome.filename))
          ) {
            UNLINKASYNC(await CaminhoServidorService.pathFile(nome.filename));
          }
        }
      }

      if (files.capa) {
        for (const capa of files.capa) {
          if (
            existsSync(await CaminhoServidorService.pathFile(capa.filename))
          ) {
            UNLINKASYNC(await CaminhoServidorService.pathFile(capa.filename));
          }
        }
      }
      throw new HttpException(
        e.response ?? 'Arquivo não anexado',
        e.status ?? 400,
      );
    }
  }

  @ApiOkResponse({
    description: 'Informa apenas o id da sugestao',
  })
  @Roles(Grupos.MARKETING)
  @Post(':id/aceitar')
  toAcceptSugestao(@Param('id') id: number) {
    return this.sugestaoService.toAcceptSugestao(id);
  }

  @ApiOkResponse({
    description: 'Informa apenas o id da sugestao e exclui direto a sugestao',
  })
  @Roles(Grupos.MARKETING)
  @Delete(':id/recusar')
  toDeleteSugestao(@Param('id') id: number) {
    return this.sugestaoService.toDeleteSugestao(id);
  }
}
