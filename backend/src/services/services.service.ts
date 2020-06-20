import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { Client } from 'src/clients/client.entity';
import { Technician } from 'src/technicians/technician.entity';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(Service)
        private servicesRepository: Repository<Service>,
    ) { }

    async create(type: string, client: Client, technician: Technician): Promise<Service> {
        const service = this.servicesRepository.create({
            type: type,
            client: client,
            technician: technician
        });
        await this.servicesRepository.save(service);
        return service;
    }

    async findById(id: number): Promise<Service> {
        const service = await this.servicesRepository.findOne({id: id});
        return service;
    }

    async updateWorkingDate(id: number) {
        this.servicesRepository.update(id, {working_date: 'now()'})
    }

    async updateCompletedDate(id: number) {
        this.servicesRepository.update(id, {completed_date: 'now()'})
    }


}