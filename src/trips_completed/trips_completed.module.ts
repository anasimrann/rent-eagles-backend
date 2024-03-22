import { Module } from '@nestjs/common';
import { TripsCompletedController } from './trips_completed.controller';
import { TripsCompletedService } from './trips_completed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsCompleted } from './entities/trips_completed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TripsCompleted])],
  controllers: [TripsCompletedController],
  providers: [TripsCompletedService],
})
export class TripsCompletedModule {}
