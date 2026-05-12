import { IsString, IsOptional, IsArray, MinLength, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkDto {
  @ApiProperty({ example: '商品展示视频作品' })
  @IsString()
  @MinLength(2, { message: '标题至少2个字符' })
  @MaxLength(100, { message: '标题最多100个字符' })
  title: string;

  @ApiProperty({ example: 'https://example.com/cover.jpg' })
  @IsString()
  coverUrl: string;

  @ApiProperty({ example: 'https://example.com/video.mp4' })
  @IsString()
  videoUrl: string;

  @ApiProperty({ example: 'PRODUCT' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: ['产品', '电商'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
