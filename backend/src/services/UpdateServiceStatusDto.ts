import { IsIn } from 'class-validator';

export class UpdateServiceStatusDto {
    @IsIn(['working', 'completed'])
    status: string;
}