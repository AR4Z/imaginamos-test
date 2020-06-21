import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { LoginClientDto } from './dto/login-client.dto';
import { Client } from './client.entity';
import * as jwt from 'jsonwebtoken';
import { ApiResponse } from '@nestjs/swagger';

@Controller('clients')
export class ClientsController {
    constructor(
        private clientsService: ClientsService,
    ) { }

    @Post()
    @ApiResponse({ status: 201, description: 'The client has been successfully created.'})
    @ApiResponse({ status: 409, description: 'A client with that email has already been registered.'})
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
    @ApiResponse({ status: 201, description: 'The client logs in successfully, you get a token with which you can consume resources such as create tickets or check the status of services.'})
    @ApiResponse({ status: 401, description: 'Email or password is wrong or there is not exist a client with that email.'})
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
            process.env.JWT_SECRET,
        );

        return {
            accessToken,
        };
    }
}