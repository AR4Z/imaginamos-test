import { IsInt, Min, Max } from 'class-validator';

export class RateServiceDto {
    @IsInt()
    @Min(0)
    @Max(5)
    rating: number;
}