import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('ClientsService')
    private readonly clientsService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest();
    const jwtToken = request.headers.authorization;

    try {
      const payload = jwt.verify(jwtToken, 'imaginamos');
      const client = await this.clientsService.findByEmail(payload.email);
      if (client) {
        request.user = client;
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }
}