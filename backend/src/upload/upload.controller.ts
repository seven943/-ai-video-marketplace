import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UploadService } from './upload.service';

const uploadsDir = join(process.cwd(), 'uploads');
if (!existsSync(join(uploadsDir, 'images'))) mkdirSync(join(uploadsDir, 'images'), { recursive: true });
if (!existsSync(join(uploadsDir, 'videos'))) mkdirSync(join(uploadsDir, 'videos'), { recursive: true });

const imageStorage = diskStorage({
  destination: './uploads/images',
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const videoStorage = diskStorage({
  destination: './uploads/videos',
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@ApiTags('上传')
@Controller('upload')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: '上传图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: imageStorage }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    this.uploadService.validateFile(file, 'image');
    return {
      url: this.uploadService.getFileUrl('images', file.filename),
      filename: file.filename,
      size: file.size,
    };
  }

  @Post('video')
  @ApiOperation({ summary: '上传视频' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: videoStorage }))
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    this.uploadService.validateFile(file, 'video');
    return {
      url: this.uploadService.getFileUrl('videos', file.filename),
      filename: file.filename,
      size: file.size,
    };
  }
}
