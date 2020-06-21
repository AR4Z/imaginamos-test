import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum TicketType {
    maintenance = 'maintenance',
    installation = 'installation'
};

export class CreateTicketDto {
    @IsIn(['maintenance', 'installation'])
    @ApiProperty({
        description: 'Type of ticket',
        enum: TicketType
    })
    type: string;
}