import {
  DiskStorageFile,
  FileFieldsInterceptor,
  UploadedFiles,
} from '@blazity/nest-file-fastify';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { existsSync } from 'fs';
import { CaminhoServidorService } from 'src/caminho-servidor/services/caminho-servicor.service';
import {
  IMAGE_TYPE,
  QUANTIDADE_UPLOAD,
  UNLINKASYNC,
  VIDEO_TYPE,
} from 'src/constants/constants';
import { FindPaginationDTO } from '../dtos/pagination.dto';
import { PlataformaDTO } from '../dtos/plataforma.dto';
import { UpdatePlataformaDTO } from '../dtos/updatePlataforma.dto';
import { PlataformaService } from '../services/plataforma.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Grupos } from 'src/auth/enum/grupo.enum';

@ApiTags('Plataforma')
@Controller('plataforma')
export class PlataformaController {
  constructor(
    private readonly plataformaService: PlataformaService,
    private readonly caminhoService: CaminhoServidorService,
  ) {}

  @Roles(Grupos.MARKETING)
  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'capa', maxCount: 1 },
        { name: 'file', maxCount: QUANTIDADE_UPLOAD },
      ],
      { dest: CaminhoServidorService.folder() },
    ),
  )
  async createPlataforma(
    @UploadedFiles()
    file: { capa: DiskStorageFile[]; file?: DiskStorageFile[] },
    @Body() plataformaDTO: PlataformaDTO,
  ) {
    try {
      const folderServer = await this.caminhoService.findFolderServer();

      if (file.file) {
        for (const nome of file.file) {
          if (!VIDEO_TYPE.test(nome.mimetype)) {
            throw new BadRequestException({
              message: 'Tipo de arquivo inválido.',
            });
          }
          plataformaDTO.nome = nome.filename;
          plataformaDTO.nomeOriginal = nome.originalFilename;

          if (file.capa) {
            for (const capa of file.capa) {
              if (!IMAGE_TYPE.test(capa.mimetype)) {
                throw new BadRequestException({
                  message: 'Tipo de arquivo inválido.',
                });
              }
              plataformaDTO.capa = capa.filename;
            }
          }

          plataformaDTO.idcaminho = folderServer.id;
          await this.plataformaService.cratePlataforma(plataformaDTO);
        }
      }

      return true;
    } catch (e) {
      if (file.file) {
        for (const nome of file.file) {
          if (
            existsSync(await CaminhoServidorService.pathFile(nome.filename))
          ) {
            UNLINKASYNC(await CaminhoServidorService.pathFile(nome.filename));
          }
        }
        if (file.capa) {
          for (const capa of file.capa) {
            if (
              existsSync(await CaminhoServidorService.pathFile(capa.filename))
            ) {
              UNLINKASYNC(await CaminhoServidorService.pathFile(capa.filename));
            }
          }
        }
      }
      throw new HttpException(
        e.response ?? 'Arquivo não anexado',
        e.status ?? 400,
      );
    }
  }

  @Roles(Grupos.MARKETING)
  @Patch('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'capa', maxCount: 1 },
        { name: 'file', maxCount: 1 },
      ],
      { dest: CaminhoServidorService.folder() },
    ),
  )
  async updatePlataforma(
    @UploadedFiles()
    files: { capa: DiskStorageFile[]; file?: DiskStorageFile[] },
    @Param('id') id: number,
    @Body() plataformaDTO: UpdatePlataformaDTO,
  ) {
    try {
      if (files.capa) {
        for (const capa of files.capa) {
          if (!IMAGE_TYPE.test(capa.mimetype)) {
            throw new BadRequestException({
              message: 'Tipo de arquivo inválido.',
            });
          }
          plataformaDTO.capa = capa.filename;
          plataformaDTO.nomeOriginal = capa.originalFilename;
        }
      }
      if (files.file) {
        for (const file of files.file) {
          if (!VIDEO_TYPE.test(file.mimetype)) {
            throw new BadRequestException({
              message: 'Tipo de arquivo inválido.',
            });
          }
          plataformaDTO.nome = file.filename;
          plataformaDTO.nomeOriginal = file.originalFilename;
        }
      }
      await this.plataformaService.updatePlataforma(id, plataformaDTO);
    } catch (e) {
      throw new HttpException(
        e.response ?? 'Arquivo não anexado',
        e.status ?? 400,
      );
    }
  }

  @Get('pagina')
  findAllPlataforma(
    @Query(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    query: FindPaginationDTO,
  ) {
    return this.plataformaService.findAllPlataforma(query);
  }

  @ApiOkResponse({ description: 'Deleta o vide da lixeira' })
  @Roles(Grupos.MARKETING)
  @Delete('destroy/:id')
  destroyPlataforma(@Param('id') id: number) {
    return this.plataformaService.destroyPlataforma(id);
  }
}
