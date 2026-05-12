import { IsString, IsNumber, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'order-id-123' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1, { message: '评分最低1分' })
  @Max(5, { message: '评分最高5分' })
  rating: number;

  @ApiProperty({ example: '视频质量很好，非常满意' })
  @IsString()
  @MinLength(5, { message: '评价内容至少5个字符' })
  @MaxLength(500, { message: '评价内容最多500个字符' })
  content: string;
}
