import { Module } from '@nestjs/common';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarDetails } from './entities/car.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarDetails])],
  controllers: [CarController],
  providers: [CarService],
})
export class CarModule {}
