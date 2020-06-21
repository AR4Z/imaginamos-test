import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ServiceStatusType {
    working = 'working',
    completed = 'completed'
};

export class UpdateServiceStatusDto {
    @IsIn(['working', 'completed'])
    @ApiProperty({
        description: 'New service status',
        enum: ServiceStatusType
    })
    status: string;
}