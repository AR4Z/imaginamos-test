import { Controller, Post, Body, UseGuards, Req, Get, Param, Inject, Patch, HttpException, HttpStatus, Res, Query } from '@nestjs/common';
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
import { ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';


enum ServiceStatus {
    Waiting = 'waiting', // assigned but the technician has not been started his work
    Working = 'working', // the assigned technician is working on it
    Completed = 'completed', // the assigned technician has been completed his work
  }

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
            process.env.JWT_SECRET,
        );
        const redisClientTickets = this.redisService.getClient('tickets');

        redisClientTickets.set(ticketToken, JSON.stringify(ticket), 'ex', 900);
        const messageVerification = {
            to: req.user.email,
            from: process.env.SENDER_EMAIL,
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
                    service_id: service.id,
                    client_id: service.client.id
                },
                process.env.JWT_SECRET,
            );
            const msgValidatedTicket = {
                to: client.email,
                from: process.env.SENDER_EMAIL,
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
    async service(@Param() params, @Req() req, @Res() res): Promise<void> {
        try {
            let payload = jwt.verify(params.serviceToken, process.env.JWT_SECRET);
            const service = await this.servicesService.findById(payload.service_id);

            if (service) {
                if (req.user.id === parseInt(payload.client_id)) {
                    res.status(HttpStatus.OK).send({
                        ...service
                    })
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
        } catch(e) {
            res.status(HttpStatus.BAD_REQUEST).send({
                message: 'A problem probably occurred with the token.'
            });
        }
    }

    // allow that a technician receive his services
    @UseGuards(AuthGuard)
    @Get()
    @ApiBearerAuth()
    @ApiQuery({name: 'status', enum: ServiceStatus, required: false})
    @ApiResponse({ status: 200, description: 'You received the services succeeded'})
    async getServices(@Req() req, @Query() query): Promise<Object> {
        const { status } = query;
        const filters = {
            'technicianId': parseInt(req.user.id),
            'status': status
        };

        const services = await this.servicesService.findAll(filters);
        return services;
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
