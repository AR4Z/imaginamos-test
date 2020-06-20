import { Controller, Post, Body } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './CreateTechnicianDto';

@Controller('technicians')
export class TechniciansController {
    constructor(
        private techniciansService: TechniciansService,
    ) { }

    @Post()
    signUp(@Body() createTechnicianDto: CreateTechnicianDto): void {
        const client = this.techniciansService.create(createTechnicianDto.name, createTechnicianDto.email, createTechnicianDto.password);
    }
}
