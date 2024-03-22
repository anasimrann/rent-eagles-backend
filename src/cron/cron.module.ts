import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { BookingModule } from 'src/booking/booking.module';
import { BookingService } from 'src/booking/booking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from 'src/booking/entities/booking.entity';
import { TripsCompletedService } from 'src/trips_completed/trips_completed.service';
import { TripsCompletedModule } from 'src/trips_completed/trips_completed.module';
import { TripsCompleted } from 'src/trips_completed/entities/trips_completed.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingEntity, TripsCompleted]),
    BookingModule,
    TripsCompletedModule,
  ],
  providers: [CronService, BookingService, TripsCompletedService],
})
export class CronModule {}
