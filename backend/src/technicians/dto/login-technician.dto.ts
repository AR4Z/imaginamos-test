import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginTechnicianDto {
    @IsEmail()
    @ApiProperty({
        description: 'A already registered email technician',
    })
    email: string;

    @IsNotEmpty()
    @ApiProperty({
        description: 'The password',
    })
    password: string;
}