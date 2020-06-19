
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client)
        private clientsRepository: Repository<Client>,
    ) { }
    
    async findByEmail(clientEmail: string): Promise<Client | null> {
        return await this.clientsRepository.findOne({ email: clientEmail });
    }

    async create(name: string, email: string, password: string): Promise<Client> {
        const client = this.clientsRepository.create({
            name: name,
            email: email,
            password: password,
        });
        await this.clientsRepository.save(client);
        return client;
    }
}