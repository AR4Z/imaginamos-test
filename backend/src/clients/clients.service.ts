
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client)
        private clientsRepository: Repository<Client>,
    ) { }

    async findById(clientId: number): Promise<Client | null> {
        return await this.clientsRepository.findOne({ id: clientId });
    }

    async findByEmail(clientEmail: string): Promise<Client | null> {
        return await this.clientsRepository.findOne({ email: clientEmail });
    }

    async create(name: string, email: string, password: string): Promise<Client> {
        const client = this.clientsRepository.create({
            name: name,
            email: email,
            password: password,
        });
        return await this.clientsRepository.save(client);
    }

    async getPassword(id: number): Promise<string> {
        return (await this.clientsRepository.createQueryBuilder('client')
            .select(['client.password'])
            .where('client.id = :id', { id: id })
            .addSelect('password')
            .getOne()).password
    }
}