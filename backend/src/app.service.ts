import { Injectable, OnModuleInit } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class AppService implements OnModuleInit{
  onModuleInit() {
    // set sengrid API key
    sgMail.setApiKey(process.env.SENGRID_API_KEY);
  }
  getHello(): string {
    return '¡Hola! Ve a ver mi documentación en /api';
  }
}
