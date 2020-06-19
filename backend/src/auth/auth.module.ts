import { Module, } from '@nestjs/common';
import { ClientsController } from 'src/clients/clients.controller';
import { ClientsModule } from 'src/clients/clients.module';

@Module({
  imports: [ClientsModule],
  providers: []
})
export class AuthModule {}