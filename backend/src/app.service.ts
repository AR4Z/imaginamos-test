import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '¡Hola! Ve a ver mi documentación en /api';
  }
}
