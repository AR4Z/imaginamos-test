import { Controller, Post, Body } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './CreateUserDto';
import { LoginClientDto } from './LoginClientDto';
import { Client } from './client.entity';
import * as jwt from 'jsonwebtoken';

@Controller('clients')
export class ClientsController {
    constructor(
        private clientsService: ClientsService,
    ) { }

    @Post()
    signUp(@Body() createClientDto: CreateClientDto): void {
        const client = this.clientsService.create(createClientDto.name, createClientDto.email, createClientDto.password);
    }

    @Post('login')
    async login(@Body() loginClientDto: LoginClientDto) {
        const client = await this.clientsService.findByEmail(loginClientDto.email);
        const isValidPassword = await client.comparePassword(loginClientDto.password)

        if (client && isValidPassword) {
            return this.createToken(client);
        }
        return null;
    }

    createToken(client: Client) {
        const accessToken = jwt.sign(
            {
                id: client.id,
                email: client.email,
                name: client.name,
            },
            'imaginamos',
        );

        return {
            accessToken,
        };
    }
}