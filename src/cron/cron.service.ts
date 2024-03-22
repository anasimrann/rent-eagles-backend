import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment';
import { BookingService } from 'src/booking/booking.service';
import { statusType } from 'src/booking/entities/booking.entity';
import { TripsCompleted } from 'src/trips_completed/entities/trips_completed.entity';
import { TripsCompletedService } from 'src/trips_completed/trips_completed.service';
@Injectable()
export class CronService {
  constructor(
    private bookingService: BookingService,
    private tripsCompleted: TripsCompletedService,
  ) {}
  private readonly logger = new Logger(CronService.name);

  @Cron('1 0 * * *')
  async handleCron() {
    let bookings = await this.bookingService.findAllBookings();
    for (const item of bookings) {
      const endDate = moment(item.end_date).format('YYYY-MM-DD');
      const yesterday = moment(Date.now())
        .subtract(1, 'days')
        .format('YYYY-MM-DD');

      const startDate = moment(item.start_date).format('YYYY-MM-DD');
      const currentDate = moment(Date.now()).format('YYYY-MM-DD');
      if (
        startDate === currentDate &&
        item.status == statusType.YET_TO_DELIVER
      ) {
        item.status = statusType.PROGRESS;
      }
      if (endDate == yesterday && item.status == statusType.PROGRESS) {
        item.status = statusType.COMPLETED;
        let trip = new TripsCompleted();
        trip.start_date = item.start_date;
        trip.end_date = item.end_date;
        trip.host = item.host;
        trip.driver = item.driver;
        trip.car = item.car;
        await this.tripsCompleted.Save(trip);
      }
      await this.bookingService.Save(item);
    }
    this.logger.debug(bookings);
  }
}
