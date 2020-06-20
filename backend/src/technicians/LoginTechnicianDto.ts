import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginTechnicianDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}