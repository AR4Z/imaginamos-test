import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginClientDto {
    @IsEmail()
    @ApiProperty({
        description: 'A already registered email client',
    })
    email: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'The password',
    })
    password: string;
}