import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { Technician } from './technician.entity';
import * as jwt from 'jsonwebtoken';
import { LoginTechnicianDto } from './dto/login-technician.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('technicians')
export class TechniciansController {
    constructor(
        private techniciansService: TechniciansService,
    ) { }

    @Post()
    @ApiResponse({ status: 201, description: 'The technician has been successfully created.'})
    @ApiResponse({ status: 409, description: 'A technician with that email has already been registered.'})
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
    @ApiResponse({ status: 201, description: 'The technician logs in successfully, you get a token with which you can consume resources such as change service status or get your assigned services.'})
    @ApiResponse({ status: 401, description: 'Email or password is wrong or there is not exist a technician with that email.'})
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
            process.env.JWT_SECRET,
        );

        return {
            accessToken,
        };
    }
}
