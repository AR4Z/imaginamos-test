import { Module, } from '@nestjs/common';
import { ClientsModule } from 'src/clients/clients.module';

@Module({
  imports: [ClientsModule],
  providers: []
})
export class AuthModule {}