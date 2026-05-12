import { IsString, IsNumber, IsOptional, IsArray, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: '商品展示视频需求' })
  @IsString()
  @MinLength(5, { message: '标题至少5个字符' })
  @MaxLength(100, { message: '标题最多100个字符' })
  title: string;

  @ApiProperty({ example: '需要一个30秒的商品展示视频' })
  @IsString()
  @MinLength(10, { message: '描述至少10个字符' })
  @MaxLength(2000, { message: '描述最多2000个字符' })
  description: string;

  @ApiProperty({ example: 'PRODUCT' })
  @IsString()
  category: string;

  @ApiProperty({ example: 300 })
  @IsNumber()
  @Min(1, { message: '最低预算不能低于1元' })
  @Max(1000000, { message: '最低预算不能超过100万' })
  budgetMin: number;

  @ApiProperty({ example: 800 })
  @IsNumber()
  @Min(1, { message: '最高预算不能低于1元' })
  @Max(1000000, { message: '最高预算不能超过100万' })
  budgetMax: number;

  @ApiProperty({ example: '2026-06-01' })
  @IsString()
  deadline: string;

  @ApiPropertyOptional({ example: ['https://example.com/ref1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  styleRefUrls?: string[];
}

export class SubmitQuoteDto {
  @ApiProperty({ example: 800 })
  @IsNumber()
  @Min(1, { message: '报价不能低于1元' })
  @Max(1000000, { message: '报价不能超过100万' })
  quotedPrice: number;

  @ApiProperty({ example: '2026-05-20' })
  @IsString()
  quotedDeadline: string;
}
