
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