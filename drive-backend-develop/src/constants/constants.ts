import { unlinkSync } from 'fs';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

dotenv.config();

export const FOLDER_STORAGE = './storage/';
export const UNLINKASYNC = promisify(unlinkSync);
export const FILE_TYPE = /pdf|doc|docx|xlsx|xls|pptx|ppt|odt|ods/;
export const VIDEO_TYPE = /mp4/;
export const IMAGE_TYPE = /jpeg|jpg|png|gif|webp/;
export const SUGESTAO_TYPE = /pdf|mp4|jpeg|jpg|png|gif|webp/;
export const url = process.env.URL_FILES;

export const QUANTIDADE_UPLOAD = 30;

export const TIPO = {
  IMAGEM: 1,
  DOCUMENTO: 2,
  VIDEO: 3,
};

export const DIAS = 30;

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
};
