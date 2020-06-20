import { Controller, Post, Body, UseGuards, Req, Get, Param, Inject, Put, Patch } from '@nestjs/common';
import { ServicesService } from './services.service';
import * as jwt from 'jsonwebtoken';
import * as sgMail from '@sendgrid/mail';
import { CreateTicketDto } from './CreateTicketDto';
import { Ticket } from './Ticket';
import { AuthGuard } from 'src/auth/auth.guard';
import { RedisService } from 'nestjs-redis';
import { Service } from './service.entity';
import { UpdateServiceStatusDto } from './UpdateServiceStatusDto';
import { RateServiceDto } from './RateServiceDto';

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

    @UseGuards(AuthGuard)
    @Post('ticket')
    createTicket(@Body() createTicketDto: CreateTicketDto, @Req() req): void {
        const ticket = {
            userId: req.user.id,
            type: createTicketDto.type
        }
        const ticketToken = this.createTicketToken(ticket)
        const redisClientTickets = this.redisService.getClient('tickets');

        redisClientTickets.set(ticketToken, JSON.stringify(ticket), 'ex', 900);
        this.sendVerificationMail(ticketToken, req.user.email);
    }

    @UseGuards(AuthGuard)
    @Get('ticket/verify/:ticketToken')
    async verifyTicketRequest(@Param() params) {
        const redisClientTickets = this.redisService.getClient('tickets');
        const exists = await redisClientTickets.exists(params.ticketToken);

        if (exists) {
            const value = await redisClientTickets.get(params.ticketToken);
            const ticket: Ticket = JSON.parse(value);
            const client = await this.clientsService.findById(ticket.userId);
            const technician = await this.techniciansService.getOneRandom();

            redisClientTickets.del(params.tickeToken);
            const service: Service = await this.servicesService.create(ticket.type, client, technician);
            const serviceToken = this.createServiceToken(service);
            this.sendValidatedTicketMail(serviceToken, client.email);
        } else {
            //
        }
    }

    @UseGuards(AuthGuard)
    @Get('track/:serviceToken')
    async service(@Param() params) {
        try {
            const payload = jwt.verify(params.serviceToken, 'imaginamos');
            const service = await this.servicesService.findById(payload.id);

            if (service) {
                return {
                    ...service
                }
            }
        } catch {
            return null;
        }
    }

    @Patch('status/:idService')
    async updateService(@Body() updateServiceStatusDto: UpdateServiceStatusDto, @Param() params){
        const status = updateServiceStatusDto.status;

        if (status === 'working') {
            this.servicesService.updateWorkingDate(params.idService);
        } else {
            this.servicesService.updateCompletedDate(params.idService);
        }
    }

    @Patch('rate/:idService')
    async rateService(@Body() rateServiceDto: RateServiceDto, @Param() params) {
        const rating = rateServiceDto.rating;
        this.servicesService.updateRating(params.idService, rating);
    }

    async sendVerificationMail(ticketToken: string, email: string) {
        sgMail.setApiKey('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');
        const msg = {
            to: email,
            from: 'ohernandezn@unal.edu.co',
            subject: 'Verify your identity - Imaginamos Test',
            html: `Verify your identity for schedule your service: <a href="http://localhost:3000/services/ticket/verify/${ticketToken}">Verify</a>`
        };

        try {
            await sgMail.send(msg);
        } catch (error) {
            console.error(error);

            if (error.response) {
                console.error(error.response.body)
            }
        }
    }

    async sendValidatedTicketMail(serviceToken: string, email: string) {
        sgMail.setApiKey('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');
        const msg = {
            to: email,
            from: 'ohernandezn@unal.edu.co',
            subject: 'Your service has been scheduled - Imaginamos Test',
            html: `Hey! your service has been scheduled, you can it track follow the next link: <a href="http://localhost:3000/services/track/${serviceToken}">Track</a>`
        };

        try {
            await sgMail.send(msg);
        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error(error.response.body)
            }
        }
    }


    createTicketToken(ticket: Ticket) {
        const ticketToken = jwt.sign(
            {
                ...ticket
            },
            'imaginamos',
        );

        return ticketToken;
    }

    createServiceToken(service: Service) {
        const serviceToken = jwt.sign(
            {
                ...service
            },
            'imaginamos',
        );

        return serviceToken;
    }

    createRatingServiceToken(service: Service) {
        const ratingServiceToken = jwt.sign(
            {
                ...service
            },
            'imaginamos',
        );

        return ratingServiceToken;
    }
}