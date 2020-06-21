import { Controller, Post, Body, UseGuards, Req, Get, Param, Inject, Patch, HttpException, HttpStatus, Res } from '@nestjs/common';
import { ServicesService } from './services.service';
import * as jwt from 'jsonwebtoken';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from '../interfaces/ticket.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { RedisService } from 'nestjs-redis';
import { Service } from './service.entity';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { RateServiceDto } from './dto/rate-service.dto';
import sendEmail from 'src/utils/sendEmail';
import { ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@Controller('services')
export class ServicesController {
    constructor(
        @Inject('TechniciansService')
        private readonly techniciansService,
        @Inject('ClientsService')
        private readonly clientsService,
        private servicesService: ServicesService,
        private readonly redisService: RedisService,
    ) { }

    // Create ticket
    @UseGuards(AuthGuard)
    @Post('ticket')
    @ApiBearerAuth()
    @ApiResponse({ status: 201, description: 'The ticket has been successfully created. Check your email.'})
    async createTicket(@Body() createTicketDto: CreateTicketDto, @Req() req): Promise<Object> {
        const ticket = {
            userId: req.user.id,
            type: createTicketDto.type
        }
        const ticketToken = jwt.sign(
            {
                ...ticket
            },
            'imaginamos',
        );
        const redisClientTickets = this.redisService.getClient('tickets');

        redisClientTickets.set(ticketToken, JSON.stringify(ticket), 'ex', 900);
        const messageVerification = {
            to: req.user.email,
            from: 'ohernandezn@unal.edu.co',
            subject: 'Verify your identity - Imaginamos Test',
            html: `Verify your identity for schedule your service: <a href="http://localhost:3000/services/ticket/verify/${ticketToken}">Verify</a>`
        };

        await sendEmail(messageVerification);
        return {
            message: 'A ticket has been created, to schedule the service check your email and you can validate your identity.'
        }
    }

    // Verify the identity of the customer who created the ticket and schedule the service
    @UseGuards(AuthGuard)
    @Get('ticket/verify/:ticketToken')
    @ApiBearerAuth()
    @ApiParam({name: 'ticketToken', description: 'The token that was received in the email after the ticket was created'})
    @ApiResponse({ status: 200, description: 'The identity was verified and the service was created. Check your email.'})
    @ApiResponse({ status: 404, description: 'Error with ticket token, maybe it is expired.'})
    async verifyTicketRequest(@Param() params): Promise<Object> {
        const redisClientTickets = this.redisService.getClient('tickets');
        const exists = await redisClientTickets.exists(params.ticketToken);

        if (exists) {
            const value = await redisClientTickets.get(params.ticketToken);
            const ticket: Ticket = JSON.parse(value);
            const client = await this.clientsService.findById(ticket.userId);
            const technician = await this.techniciansService.getOneRandom();

            redisClientTickets.del(params.tickeToken);
            const service: Service = await this.servicesService.create(ticket.type, client, technician);
            const serviceToken = jwt.sign(
                {
                    ...service
                },
                'imaginamos',
            );
            const msgValidatedTicket = {
                to: client.email,
                from: 'ohernandezn@unal.edu.co',
                subject: 'Your service has been scheduled - Imaginamos Test',
                html: `Hey! your service has been scheduled, you can it track follow the next link: <a href="http://localhost:3000/services/track/${serviceToken}">Track</a>`
            };
            await sendEmail(msgValidatedTicket);

            return {
                message: 'A link has been sent to your email with which you can track your service.'
            }
        } else {
            throw new HttpException('Error with ticket token, maybe it is expired.', HttpStatus.NOT_FOUND);
        }
    }

    // allow tracks the  service by the client using a token
    @UseGuards(AuthGuard)
    @Get('track/:serviceToken')
    @ApiBearerAuth()
    @ApiParam({name: 'serviceToken', description: 'The token that was received in the email after the service was created'})
    @ApiResponse({ status: 200, description: 'You received the status of the service.'})
    @ApiResponse({ status: 403, description: 'That service is not yours.'})
    @ApiResponse({ status: 404, description: 'Service has not been found.'})
    @ApiResponse({ status: 400, description: 'A problem probably occurred with the token.'})
    async service(@Param() params, @Req() req, @Res() res): Promise<Object> {
        try {
            const payload = await jwt.verify(params.serviceToken, 'imaginamos');
            const service = await this.servicesService.findById(payload.id);

            if (service) {
                if (req.user.id === service.client.id) {
                    return {
                        ...service
                    }
                } else {
                    res.status(HttpStatus.FORBIDDEN).send({
                        message: 'That service is not yours.'
                    });
                }
            } else {
                res.status(HttpStatus.NOT_FOUND).send({
                    message: 'Service has not been found.'
                });
            }
        } catch {
            res.status(HttpStatus.BAD_REQUEST).send({
                message: 'A problem probably occurred with the token.'
            });
        }
    }

    // Allow change the service status by the technician that was assigned
    @UseGuards(AuthGuard)
    @Patch(':idService/status')
    @ApiBearerAuth()
    @ApiParam({name: 'idService', description: 'The id of the service that the technician wants to change the status.'})
    @ApiResponse({ status: 200, description: 'You updated the service status.'})
    @ApiResponse({ status: 404, description: 'The service has not been found.'})
    async updateService(@Body() updateServiceStatusDto: UpdateServiceStatusDto, @Param() params) {
        const status = updateServiceStatusDto.status;
        const service = await this.servicesService.findById(params.idService);

        if (service) {
            if (status === 'working') {
                this.servicesService.updateWorkingDate(params.idService);
            } else {
                this.servicesService.updateCompletedDate(params.idService);
            }
        } else {
            throw new HttpException('Service doens\'t exists.', HttpStatus.NOT_FOUND);
        }
    }

    // Allow rating the service by the user
    @UseGuards(AuthGuard)
    @Patch(':idService/rate')
    @ApiBearerAuth()
    @ApiParam({name: 'idService', description: 'The id of the service that the customer wants to change the rate.'})
    @ApiResponse({ status: 200, description: 'You updated the service rating.'})
    @ApiResponse({ status: 404, description: 'The service has not been found.'})
    async rateService(@Body() rateServiceDto: RateServiceDto, @Param() params) {
        const rating = rateServiceDto.rating;
        const service = await this.servicesService.findById(params.idService);

        if (service) {
            this.servicesService.updateRating(params.idService, rating);
        } else {
            throw new HttpException('Service doens\'t exists.', HttpStatus.NOT_FOUND);
        }
    }
}
