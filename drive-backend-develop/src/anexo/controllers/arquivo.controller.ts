import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  UnprocessableEntityException,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ArquivoService } from '../services/arquivo.service';
import { ArquivoDTO } from '../dtos/arquivo.dto';
import {
  DiskStorageFile,
  FileFieldsInterceptor,
  UploadedFiles,
} from '@blazity/nest-file-fastify';
import {
  UNLINKASYNC,
  FILE_TYPE,
  IMAGE_TYPE,
  QUANTIDADE_UPLOAD,
} from 'src/constants/constants';
import { FindPaginationDTO } from '../dtos/pagination.dto';
import { UpdateArquivoDTO } from '../dtos/updateArquivo.dto';
import { CaminhoServidorService } from 'src/caminho-servidor/services/caminho-servicor.service';
import { existsSync } from 'fs';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Grupos } from 'src/auth/enum/grupo.enum';

@ApiTags('Arquivo')
@Controller('arquivo')
export class ArquivoController {
  constructor(
    private readonly arquivoService: ArquivoService,
    private readonly caminhoService: CaminhoServidorService,
  ) {}

  @Roles(Grupos.MARKETING)
  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: QUANTIDADE_UPLOAD },
        { name: 'capa', maxCount: 1 },
      ],
      { dest: CaminhoServidorService.folder() },
    ),
  )
  async createArquivo(
    @UploadedFiles()
    files: { file: DiskStorageFile[]; capa: DiskStorageFile[] },
    @Body() arquivoDTO: ArquivoDTO,
  ) {
    try {
      const folderServer = await this.caminhoService.findFolderServer();
      for (const file of files.file) {
        if (!FILE_TYPE.test(file.mimetype)) {
          throw new UnprocessableEntityException({
            message: 'Tipo de arquivo inválido.',
          });
        }

        arquivoDTO.nome = file.filename;
        arquivoDTO.nomeOriginal = file.originalFilename;

        if (files.capa) {
          for (const capa of files.capa) {
            if (!IMAGE_TYPE.test(capa.mimetype)) {
              throw new UnprocessableEntityException({
                message: 'Tipo de arquivo inválido.',
              });
            }
            arquivoDTO.capa = capa.filename;
          }
        }
        arquivoDTO.idcaminho = folderServer.id;
        await this.arquivoService.createArquivo(arquivoDTO);
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
  @Get('pagina')
  findAllArquivo(
    @Query(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    query: FindPaginationDTO,
  ) {
    return this.arquivoService.findAllArquivo(query);
  }

  @Roles(Grupos.MARKETING)
  @Patch('update/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'nome', maxCount: 1 },
        { name: 'capa', maxCount: 1 },
      ],
      { dest: CaminhoServidorService.folder() },
    ),
  )
  async updateArquivo(
    @UploadedFiles() file: { nome: DiskStorageFile[]; capa: DiskStorageFile[] },
    @Param('id') id: number,
    @Body() arquivoDTO: UpdateArquivoDTO,
  ) {
    try {
      if (file.capa) {
        for (const capa of file.capa) {
          if (!IMAGE_TYPE.test(capa.mimetype)) {
            throw new UnprocessableEntityException({
              message: 'Tipo de arquivo inválido.',
            });
          }
          arquivoDTO.capa = capa.filename;
        }
      }
      if (file.nome) {
        for (const nome of file.nome) {
          if (!FILE_TYPE.test(nome.mimetype)) {
            throw new UnprocessableEntityException({
              message: 'Tipo de arquivo inválido.',
            });
          }
          arquivoDTO.nome = nome.filename;
          arquivoDTO.nomeOriginal = nome.originalFilename;
        }
      }
      await this.arquivoService.updateArquivo(id, arquivoDTO);
      return true;
    } catch (e) {
      if (file.nome) {
        await Promise.all(
          file.nome.map(async (nome) => {
            if (
              existsSync(await CaminhoServidorService.pathFile(nome.filename))
            ) {
              UNLINKASYNC(await CaminhoServidorService.pathFile(nome.filename));
            }
            if (file.capa) {
              file.capa.map(async (capa) => {
                if (
                  existsSync(
                    await CaminhoServidorService.pathFile(capa.filename),
                  )
                ) {
                  UNLINKASYNC(
                    await CaminhoServidorService.pathFile(capa.filename),
                  );
                }
              });
            }
          }),
        );
      }
      throw new HttpException(
        e.response ?? 'Arquivo não anexado',
        e.status ?? 400,
      );
    }
  }

  @Roles(Grupos.MARKETING)
  @Delete(':id')
  destroyArquivo(@Param('id') id: number) {
    return this.arquivoService.destroyArquivo(id);
  }
}
