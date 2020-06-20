import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
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
    async signUp(@Body() createClientDto: CreateClientDto): Promise<Client | Object> {
        const client = await this.clientsService.findByEmail(createClientDto.email);

        if (client) {
            throw new HttpException('A client with that email has already been registered', HttpStatus.CONFLICT);
        } else {
            const newClient = await this.clientsService.create(createClientDto.name,
                createClientDto.email,
                createClientDto.password);
            return newClient;
        }
    }

    @Post('login')
    async login(@Body() loginClientDto: LoginClientDto): Promise<Object> {
        const client = await this.clientsService.findByEmail(loginClientDto.email);

        if (client) {
            const isValidPassword = await client.comparePassword(loginClientDto.password);

            if(isValidPassword) {
                return this.createToken(client);
            } else {
                throw new HttpException('Email or password is wrong.', HttpStatus.UNAUTHORIZED);
            }
        } else {
            throw new HttpException('There is not exist a client with that email.', HttpStatus.UNAUTHORIZED);
        }
    }

    private createToken(client: Client) {
        const accessToken = jwt.sign(
            {
                id: client.id,
                email: client.email,
                name: client.name,
                role: 'client'
            },
            'imaginamos',
        );

        return {
            accessToken,
        };
    }
}