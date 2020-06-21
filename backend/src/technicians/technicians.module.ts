import { Module, } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechniciansService } from './technicians.service';
import { TechniciansController } from './technicians.controller';
import { Technician } from './technician.entity';
import { TechnicianSeed } from './seeds/technician.seed';

@Module({
  imports: [TypeOrmModule.forFeature([Technician])],
  exports: [TechniciansService, TechnicianSeed],
  providers: [TechniciansService, TechnicianSeed],
  controllers: [TechniciansController],
})
export class TechniciansModule {}