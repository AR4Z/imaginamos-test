import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RateServiceDto {
    @IsInt()
    @Min(0)
    @Max(5)
    @ApiProperty({
        description: 'Rating for this service',
        minimum: 0,
        maximum: 5
    })
    rating: number;
}