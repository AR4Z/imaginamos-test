import { IsIn } from 'class-validator';

export class CreateTicketDto {
    @IsIn(['maintenance', 'installation'])
    type: string;
}