import multipart from '@fastify/multipart';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { DriveModule } from './drive.module';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    DriveModule,
    new FastifyAdapter({
      bodyLimit: Number(process.env.LIMIT_FILE_UPLOAD) * 1024 * 1024,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Drive')
    .setDescription('The Drive API description')
    .setVersion('0.01')
    .addTag('Drive')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors();
  app.useStaticAssets({
    root: join(__dirname, '..', 'storage'),
    prefix: '/storage/',
  });

  app.register(multipart as any);

  await app.listen(parseInt(process.env.PORT, 10) || 3000, '0.0.0.0');
}
bootstrap();
