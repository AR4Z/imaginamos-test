import { Injectable, CanActivate, ExecutionContext, Inject, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('ClientsService')
    private readonly clientsService,
    @Inject('TechniciansService')
    private readonly techniciansService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest();
    let token = request.headers.authorization;
    
    // only accept Bearer auth
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    } else {
      console.log('not bearer')
      return false;
    }

    const path = request.route.path;
    const clientPaths = [
      '/services/ticket',
      '/services/ticket/verify/:ticketToken',
      '/services/:idService/rate',
    ];
    const technicianPaths = [
      '/services/:idService/status',
      '/services'
    ];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const role = payload.role;
      let user;

      if (role === 'technician') {
        if (clientPaths.includes(path)) {
          return false;
        }

        user = await this.techniciansService.findByEmail(payload.email);
      } else if (role == 'client') {
        if (technicianPaths.includes(path)) {
          return false;
        }

        user = await this.clientsService.findByEmail(payload.email);
      } else {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      if (user) {
        request.user = user;
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }
}