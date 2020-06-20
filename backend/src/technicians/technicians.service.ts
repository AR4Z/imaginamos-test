import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Technician } from './technician.entity';

@Injectable()
export class TechniciansService {
    constructor(
        @InjectRepository(Technician)
        private techniciansRepository: Repository<Technician>,
    ) { }
    
    // create a technician
    async create(name: string, email: string, password: string): Promise<Technician> {
        const technician = this.techniciansRepository.create({
            name: name,
            email: email,
            password: password,
        });
        await this.techniciansRepository.save(technician);
        return technician;
    }

    // get a random technician
    async getOneRandom(): Promise<Technician> {
        const technician  = await this.techniciansRepository.query('select * from technician order by random() limit 1');
        return technician[0];
    }

    // get a technician by its email
    async findByEmail(email: string): Promise<Technician | null> {
        const technician = await this.techniciansRepository.findOne({email: email});
        return technician;
    }
}