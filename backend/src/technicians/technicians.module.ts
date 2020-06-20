import { Module, } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechniciansService } from './technicians.service';
import { TechniciansController } from './technicians.controller';
import { Technician } from './technician.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Technician])],
  exports: [TechniciansService],
  providers: [TechniciansService],
  controllers: [TechniciansController],
})
export class TechniciansModule {}