import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateTechnicianDto {
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}