import { IsString, IsOptional, IsArray, IsNumber, IsUrl, Min, Max, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: '小明' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '昵称至少2个字符' })
  @MaxLength(20, { message: '昵称最多20个字符' })
  nickname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class RegisterCreatorDto {
  @ApiPropertyOptional({ example: '专业AI视频创作者' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '简介最多500个字符' })
  bio?: string;

  @ApiPropertyOptional({ example: ['产品展示', '品牌宣传'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: ['Runway', 'Pika'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiTools?: string[];

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  priceMin?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  priceMax?: number;
}

export class UpdateCreatorProfileDto {
  @ApiPropertyOptional({ example: '专业AI视频创作者' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '简介最多500个字符' })
  bio?: string;

  @ApiPropertyOptional({ example: ['产品展示', '品牌宣传'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: ['Runway', 'Pika'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiTools?: string[];

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  priceMin?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  priceMax?: number;

  @ApiPropertyOptional({ example: ['https://example.com/portfolio1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  portfolioUrls?: string[];

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;
}
