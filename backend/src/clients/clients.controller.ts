
import { Controller, Post, Body } from '@nestjs/common';
import { ClientsService } from './clients.service';


@Controller('clients')
export class ClientsController {
    constructor(
        private clientsService: ClientsService,
    ) { }

    @Post()
    signUp(@Body() req: any): void {
        const client = this.clientsService.create(req.name, req.email, req.password);
    }
}