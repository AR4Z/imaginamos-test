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
import { RedisModule } from 'nestjs-redis'
import { TechniciansModule } from './technicians/technicians.module';
import { CommandModule } from 'nestjs-command';
require('dotenv').config()

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Client, Technician, Service],
      synchronize: true,
    }),
    RedisModule.register([{
      name: 'tickets',
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      db: parseInt(process.env.REDIS_DB)
    },
    ]),
    ServicesModule,
    ClientsModule,
    TechniciansModule,
    AuthModule,
    CommandModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
