import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { ServicesService } from './services.service';
import * as jwt from 'jsonwebtoken';
import * as sgMail from '@sendgrid/mail';
import { CreateTicketDto } from './CreateTicketDto';
import { Ticket } from './Ticket';
import { AuthGuard } from 'src/auth/auth.guard';
import { RedisService } from 'nestjs-redis';

@Controller('services')
export class ServicesController {
    constructor(
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

    async sendVerificationMail(ticketToken: string, email: string) {
        sgMail.setApiKey('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');
        const msg = {
            to: email,
            from: 'ohernandezn@unal.edu.co', // Use the email address or domain you verified above
            subject: 'Verify your identity - Imaginamos Test',
            html: `Verify your identity for schedule your service: <a href="http://localhost:3000/services?ticketToken=${ticketToken}">Verify</a>`
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
}