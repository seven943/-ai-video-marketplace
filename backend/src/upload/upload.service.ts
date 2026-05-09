import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  getFilePath(type: 'images' | 'videos', filename: string): string {
    return join(this.uploadDir, type, filename);
  }

  getFileUrl(type: 'images' | 'videos', filename: string): string {
    return `/uploads/${type}/${filename}`;
  }

  validateFile(file: Express.Multer.File, type: 'image' | 'video') {
    if (!file) {
      throw new BadRequestException('请选择文件');
    }

    if (type === 'image') {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimes.includes(file.mimetype)) {
        throw new BadRequestException('仅支持 JPG/PNG/WebP/GIF 格式');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new BadRequestException('图片大小不能超过 10MB');
      }
    }

    if (type === 'video') {
      const allowedMimes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
      if (!allowedMimes.includes(file.mimetype)) {
        throw new BadRequestException('仅支持 MP4/MOV/WebM/AVI 格式');
      }
      if (file.size > 500 * 1024 * 1024) {
        throw new BadRequestException('视频大小不能超过 500MB');
      }
    }
  }
}
