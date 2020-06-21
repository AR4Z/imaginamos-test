import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
    @IsNotEmpty()
    @ApiProperty({
        description: 'Client name',
    })
    name: string;

    @IsEmail()
    @ApiProperty({
        description: 'Client email',
    })
    email: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'Client password',
    })
    password: string;
}