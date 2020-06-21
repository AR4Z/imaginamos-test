import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTechnicianDto {
    @IsNotEmpty()
    @ApiProperty({
        description: 'Technician name',
    })
    name: string;

    @IsEmail()
    @ApiProperty({
        description: 'Technician email',
    })
    email: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Technician password',
    })
    password: string;
}