import {
  DiskStorageFile,
  FileInterceptor,
  FilesInterceptor,
  UploadedFile,
  UploadedFiles,
} from '@blazity/nest-file-fastify';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CaminhoServidorService } from 'src/caminho-servidor/services/caminho-servicor.service';
import {
  IMAGE_TYPE,
  QUANTIDADE_UPLOAD,
  UNLINKASYNC,
} from 'src/constants/constants';
import { AnexoDTO } from '../dtos/anexo.dto';
import { FindPaginationDTO } from '../dtos/pagination.dto';
import { UpdateAnexoDTO } from '../dtos/updateAnexo.dto';
import { AnexoService } from '../services/anexo.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Grupos } from 'src/auth/enum/grupo.enum';
import { CurrentUser } from 'src/auth/decorators/currentUser';
import { PessoaEntity } from 'src/pessoa/entities/pessoa.entity';
import { IsPublic } from 'src/auth/decorators/isPublic';
import { GaleriaService } from 'src/galeria/services/galeria.service';
const sizeOf = require('image-size');
@ApiTags('Anexo')
@Controller('anexo')
export class AnexoController {
  constructor(
    private readonly anexoService: AnexoService,
    private caminhoService: CaminhoServidorService,
    private galeriaService: GaleriaService,
  ) {}

  // @IsPublic()
  /* @Get('teste')
  getStaticFile(): StreamableFile {
    const file = createReadStream(
      join(
        process.cwd(),
        'storage/2023/05/7f1d0e23215d9012bd81ff88053f9223.png',
      ),
    );
    return new StreamableFile(file, {
      disposition: 'inline; filename="nome.png"',
      type: 'image/png',
    });
  } */

  @Roles(Grupos.MARKETING)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        descricao: { type: 'string', description: 'opcional' },
        files: { type: 'string' },
        idCaminho: {
          type: 'number',
          description: 'apenas passar o campo vazio',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @Post('/uploads')
  @UseInterceptors(
    FilesInterceptor('file', QUANTIDADE_UPLOAD, {
      dest: CaminhoServidorService.folder(),
    }),
  )
  async saveAnexo(
    @UploadedFiles() file: DiskStorageFile[],
    @Body() anexoDTO: AnexoDTO,
  ) {
    try {
      const folderServer = await this.caminhoService.findFolderServer();
      for (const anexo of file) {
        sizeOf(anexo.path);
        if (!IMAGE_TYPE.test(anexo.mimetype)) {
          throw new UnprocessableEntityException({
            message: 'Tipo de arquivo inválido.',
          });
        }
        anexoDTO.nome = anexo.filename;
        anexoDTO.nomeOriginal = anexo.originalFilename;
        anexoDTO.idcaminho = folderServer.id;
        await this.anexoService.saveAnexo(anexoDTO);
      }

      return true;
    } catch (e) {
      if (file) {
        for (const anexo of file) {
          UNLINKASYNC(await CaminhoServidorService.pathFile(anexo.filename));
        }
      }

      throw new HttpException(
        e.response ?? 'Arquivo não anexado',
        e.status ?? 400,
      );
    }
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idanexos: { type: 'number', example: '[1,2,3]' },
      },
    },
  })
  @Post('galeria/:id')
  sendAnexoForGaleria(
    @Param('id') id: number,
    @Body('idanexos') idanexos: number[],
  ) {
    return this.anexoService.sendAnexoForGaleria(id, idanexos);
  }

  @Get('remove/:idanexo/galeria/:idgaleria')
  removeAnexoFromGaleria(
    @Param('idanexo') idanexo: number,
    @Param('idgaleria') idgaleria: number,
    @CurrentUser() pessoa: PessoaEntity,
  ) {
    return this.anexoService.removeAnexoFromGaleria(idanexo, idgaleria, pessoa);
  }

  @Post('galeria/favoritar/:idanexo')
  sendAnexoForFavoritos(
    @Param('idanexo') idanexo: number,
    @CurrentUser() pessoa: PessoaEntity,
  ) {
    return this.anexoService.sendAnexoForFavoritos(idanexo, pessoa);
  }

  @Get('remove/galeria/favoritar/:idanexo')
  removeAnexoFromFavoritos(@Param('idanexo') idanexo: number) {
    return this.anexoService.removeAnexoFromFavoritos(idanexo);
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
  @ApiOkResponse({ description: 'passa a hash do grupo' })
  @IsPublic()
  @Get('galeria/:hash')
  async findGaleriaAnexos(
    @Param('hash') hash: string,
    @CurrentUser() pessoa: any,
    @Query() query: FindPaginationDTO,
  ) {
    try {
      if (pessoa === undefined) {
        await this.galeriaService.validaPessoaGaleria(0, hash);
      } else {
        await this.galeriaService.validaPessoaGaleria(pessoa.sub, hash);
      }
      return await this.anexoService.findGaleriaAnexos(hash, query);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @IsPublic()
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
  @ApiOkResponse({ description: 'passa a hash do grupo, e os ids da tag' })
  @Get('galeria/tag/:hash')
  findGaleriaAnexosForTag(
    @Param('hash') hash: string,
    @Query() query: FindPaginationDTO,
  ) {
    return this.anexoService.findGaleriaAnexosForTag(hash, query);
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
    description: 'Retorna os anexos da pagina atual',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          titulo: { type: 'string' },
          tipo: { type: 'string' },
          nomeOriginal: { type: 'string' },
          capa: { type: 'string', description: 'caso não seja uma foto' },
          url: { type: 'string', description: 'caso seja link' },
          tags: {
            type: 'array',
            items: {
              properties: {
                id: { type: 'number' },
                nome: { type: 'string' },
                categoria: { type: 'boolean' },
                foto: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @Get('pagina')
  findAllAnexo(
    @Query(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    query: FindPaginationDTO,
  ) {
    return this.anexoService.findAllAnexo(query);
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
            nome: { type: 'string', default: 'porta branca' },
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Retorna os anexos da pagina atual com base no titulo passado',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          titulo: { type: 'string' },
          tipo: { type: 'string' },
          nomeOriginal: { type: 'string' },
          capa: { type: 'string', description: 'caso não seja uma foto' },
          url: { type: 'string', description: 'caso seja link' },
          tags: {
            type: 'array',
            items: {
              properties: {
                id: { type: 'number' },
                nome: { type: 'string' },
                categoria: { type: 'boolean' },
                foto: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @Get('titulo/pagina')
  findForTitulo(@Query() query: FindPaginationDTO) {
    return this.anexoService.findForTituloOrNomeOriginalOrTag(query);
  }

  @Get('data/pagina')
  findForDate(@Query() query: FindPaginationDTO) {
    return this.anexoService.findForDate(query);
  }

  @ApiOkResponse({
    description: 'Retorna os anexos da pagina atual',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          titulo: { type: 'string' },
          tipo: { type: 'string' },
          nomeOriginal: { type: 'string' },
          capa: { type: 'string', description: 'caso não seja uma foto' },
          url: { type: 'string', description: 'caso seja link' },
          tags: {
            type: 'array',
            items: {
              properties: {
                id: { type: 'number' },
                nome: { type: 'string' },
                categoria: { type: 'boolean' },
                foto: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @Get('tipo/:id/pagina')
  findAllForTipo(
    @Param('id') id: number,
    @Query(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    query: FindPaginationDTO,
  ) {
    return this.anexoService.findAllForTipo(id, query);
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
    description: 'Retorna os anexos da pagina atual com base nas tags passadas',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          titulo: { type: 'string' },
          tipo: { type: 'string' },
          nomeOriginal: { type: 'string' },
          capa: { type: 'string', description: 'caso não seja uma foto' },
          url: { type: 'string', description: 'caso seja link' },
          tags: {
            type: 'array',
            items: {
              properties: {
                id: { type: 'number' },
                nome: { type: 'string' },
                categoria: { type: 'boolean' },
                foto: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @Get('tag/pagina')
  findAnexoForTag(
    @Query(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    query: FindPaginationDTO,
  ) {
    return this.anexoService.findAnexoForTag(query);
  }
  @ApiOkResponse({
    description: 'Retorna os anexos sem tags.',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          titulo: { type: 'string' },
          tipo: { type: 'string' },
          nomeOriginal: { type: 'string' },
          capa: { type: 'string', description: 'caso não seja uma foto' },
          url: { type: 'string', description: 'caso seja link' },
          tags: {
            type: 'array',
            items: {
              properties: {
                id: { type: 'number' },
                nome: { type: 'string' },
                categoria: { type: 'boolean' },
                foto: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @Get('sem/tag')
  findAnexoSemTag(@Query() query: FindPaginationDTO) {
    return this.anexoService.findAnexoSemTag(query);
  }

  @ApiOkResponse({
    description: 'Retorna os anexos da pagina atual',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        titulo: { type: 'string' },
        tipo: { type: 'string' },
        nomeOriginal: { type: 'string' },
        capa: { type: 'string', description: 'caso não seja uma foto' },
        url: { type: 'string', description: 'caso seja link' },
        tags: {
          type: 'array',
          items: {
            properties: {
              id: { type: 'number' },
              nome: { type: 'string' },
              categoria: { type: 'boolean' },
              foto: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.anexoService.findOne(id);
  }

  @ApiOkResponse({
    description: 'Busca todos os anexos da lixeira',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'number' },
          titulo: { type: 'string' },
          tipo: { type: 'string' },
          nomeOriginal: { type: 'string' },
          capa: { type: 'string', description: 'caso não seja uma foto' },
          url: { type: 'string', description: 'caso seja link' },
          tags: {
            type: 'array',
            items: {
              properties: {
                id: { type: 'number' },
                nome: { type: 'string' },
                categoria: { type: 'boolean' },
                foto: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @Roles(Grupos.MARKETING)
  @Get('lixeira')
  findTrashAnexo(@Query() query: FindPaginationDTO) {
    return this.anexoService.findTrashAnexo(query);
  }

  @ApiOkResponse({ description: 'Restaura varios anexos da lixeira' })
  @Roles(Grupos.MARKETING)
  @Post('restore')
  restoreAnexo(@Body('ids') ids: number[]) {
    return this.anexoService.restoreAnexo(ids);
  }

  @ApiOkResponse({ description: 'Envia varios anexos para lixeira' })
  @HttpCode(204)
  @Roles(Grupos.MARKETING)
  @Delete('enviaLixeira')
  sendTotrashAnexo(@Body('ids') ids: number[]) {
    return this.anexoService.sendTotrashAnexo(ids);
  }

  @ApiOkResponse({ description: 'Deleta anexos da lixeira' })
  @HttpCode(204)
  @Roles(Grupos.MARKETING)
  @Delete('delete/lixeira')
  destroyAnexo(@Body('ids') ids: number[]) {
    return this.anexoService.destroyAnexos(ids);
  }

  @ApiOkResponse({ description: 'Deleta todos os anexos da lixeira' })
  @HttpCode(204)
  @Roles(Grupos.MARKETING)
  @Delete('all')
  destroyAllAnexo() {
    return this.anexoService.cleanTrash();
  }

  @Roles(Grupos.MARKETING)
  @Patch('update/:id')
  @UseInterceptors(
    FileInterceptor('file', { dest: CaminhoServidorService.folder() }),
  )
  async updateAnexo(
    @Param('id') id: number,
    @Body() anexoDTO: UpdateAnexoDTO,
    @UploadedFile() file: DiskStorageFile,
  ) {
    try {
      if (file) {
        sizeOf(file.path);
        if (!IMAGE_TYPE.test(file.mimetype)) {
          throw new UnprocessableEntityException({
            message: 'Tipo de arquivo inválido.',
          });
        }
        anexoDTO.nome = file.filename;
        anexoDTO.nomeOriginal = file.originalFilename;
      }
      await this.anexoService.updateAnexo(id, anexoDTO);
    } catch (e) {
      throw new HttpException(e.response, e.status);
    }
  }

  @Roles(Grupos.MARKETING)
  @Patch(':id/update/tag')
  updateAnexoTag(@Param('id') id: number, @Body('idtag') idtag: number[]) {
    return this.anexoService.updateAnexoTag(id, idtag);
  }
}
