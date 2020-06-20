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
    const jwtToken = request.headers.authorization;
    const path = request.route.path;
    const clientPaths = [
      '/services/ticket',
      '/services/ticket/verify/:ticketToken',
      '/services/rate/:idService',
    ];
    const technicianPaths = [
      '/services/status/:dService'
    ];

    try {
      const payload = jwt.verify(jwtToken, 'imaginamos');
      const role = payload.role;
      let user;

      if (role === 'technician') {
        if (path in clientPaths) {
          return false;
        }

        user = await this.techniciansService.findByEmail(payload.email);
      } else if (role == 'client') {
        if (path in technicianPaths) {
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
    return false;
  }
}