import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './clients/client.entity';
import { Service } from './services/service.entity';
import { Technician } from './technicians/technician.entity';
import { ClientsModule } from './clients/clients.module';
import { ServicesModule } from './services/services.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule} from 'nestjs-redis'
import { TechniciansModule } from './technicians/technicians.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'imaginamos',
      database: 'imaginamos',
      entities: [Client, Technician, Service],
      synchronize: true,
    }),
    RedisModule.register([
      {
        name:'tickets',
        url: 'redis://:@127.0.0.1:6379/1',
    },
    ]),
    ServicesModule,
    ClientsModule,
    TechniciansModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
