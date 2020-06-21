import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { TechniciansService } from '../technicians.service';

@Injectable()
export class TechnicianSeed {
    constructor(
        private readonly technicianService: TechniciansService,
    ) { }

    @Command({ command: 'create:technician', describe: 'Create a technician', autoExit: true })
    async create() {
        await this.technicianService.create('Técnico uno', 'tecnico1@gmail.com', 'tecnico1');
        await this.technicianService.create('Técnico dos', 'tecnico2@gmail.com', 'tecnico2');
    }
}