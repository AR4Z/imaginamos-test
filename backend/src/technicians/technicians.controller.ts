import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './CreateTechnicianDto';
import { Technician } from './technician.entity';
import * as jwt from 'jsonwebtoken';
import { LoginTechnicianDto } from './LoginTechnicianDto';

@Controller('technicians')
export class TechniciansController {
    constructor(
        private techniciansService: TechniciansService,
    ) { }

    @Post()
    async signUp(@Body() createTechnicianDto: CreateTechnicianDto): Promise<Technician | Object> {
        const technician = await this.techniciansService.findByEmail(createTechnicianDto.email);

        if (technician) {
            throw new HttpException('A technician with that email has already been registered.', HttpStatus.CONFLICT); 
        } else {
            const newTechnician = await this.techniciansService.create(createTechnicianDto.name, 
                createTechnicianDto.email, 
                createTechnicianDto.password);
            return newTechnician;
        }
    }

    @Post('login')
    async login(@Body() loginTechnicianDto: LoginTechnicianDto): Promise<Object> {
        const technician = await this.techniciansService.findByEmail(loginTechnicianDto.email);
    
        if (technician) {
            const isValidPassword = await technician.comparePassword(loginTechnicianDto.password);
    
            if(isValidPassword) {
                return this.createToken(technician);
            } else {
                throw new HttpException('Email or password is wrong.', HttpStatus.UNAUTHORIZED);
            }
        } else {
            throw new HttpException('There is not exist a technician with that email.', HttpStatus.UNAUTHORIZED);
        }
    }

    private createToken(technician: Technician) {
        const accessToken = jwt.sign(
            {
                id: technician.id,
                email: technician.email,
                name: technician.name,
                role: 'technician'
            },
            'imaginamos',
        );

        return {
            accessToken,
        };
    }
}
