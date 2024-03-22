import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingEntity, statusType } from './entities/booking.entity';
import * as moment from 'moment';
import { DataSource, In, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private bookingRepository: Repository<BookingEntity>,
    private dataSource: DataSource,
  ) {}

  //find any booking where driver has completed trip from particular host
  async findIfDriverCompletedTrip(driverId: number, hostId: number) {
    return await this.bookingRepository.findOne({
      select: {},
      relations: {
        host: true,
        driver: true,
      },
      where: {
        status: statusType.COMPLETED,
        host: {
          id: hostId,
        },
        driver: {
          id: driverId,
        },
      },
    });
  }

  async findDriverCompletedBooking(driverId: number) {
    return await this.bookingRepository.find({
      select: {
        driver: {
          id: true,
        },
        car: {
          id: true,
        },
      },
      relations: {
        driver: true,
        car: true,
      },
      where: {
        status: statusType.COMPLETED,
        driver: {
          id: driverId,
        },
      },
    });
  }

  async findAllBookings() {
    return await this.bookingRepository.find({
      select: {},
      relations: { car: true, driver: true, host: true },
    });
  }

  async executeQuery(query: string) {
    return await this.dataSource.query(query);
  }
  async Save(booking: BookingEntity) {
    return await this.bookingRepository.save(booking);
  }

  async findHostBookingRequests(id: number) {
    return await this.bookingRepository.find({
      select: {
        id: true,
        status: true,
        address: true,
        start_date: true,
        end_date: true,
        per_day_price: true,
        car: {
          car_name: true,
          // vin_number: true,
          // model: true,
        },
        driver: {
          first_name: true,
          last_name: true,
        },
      },
      relations: {
        car: true,
        driver: true,
      },
      where: {
        status: statusType.REQUEST_PROCESSING,
        host: {
          id: id,
        },
        car: {
          host: {
            id: id,
          },
        },
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOneBookingAndUpdate(id: number, status: statusType) {
    return await this.bookingRepository.update(
      {
        id: id,
      },
      {
        status: status,
      },
    );
  }

  async findAllHostBookings(id: number) {
    return await this.bookingRepository.find({
      select: {
        start_date: true,
        end_date: true,
        status: true,

        car: {
          id: true,
          price_per_day: true,
          car_name: true,
          photo_1: true,
          trips_completed: {
            id: true,
          },
          car_reviews: {
            rating: true,
          },
        },
      },
      relations: {
        car: {
          trips_completed: true,
          car_reviews: true,
        },
      },
      where: {
        host: {
          id: id,
        },
        car: {
          host: {
            id: id,
          },
        },
      },
    });
  }

  async findHostBookings(id: number) {
    return await this.bookingRepository.find({
      select: {
        id: true,
        status: true,
        address: true,
        start_date: true,
        end_date: true,
        per_day_price: true,
        car: {
          car_name: true,
          vin_number: true,
          model: true,
        },
        driver: {
          first_name: true,
          last_name: true,
        },
      },
      relations: {
        car: true,
        driver: true,
      },
      where: {
        status: statusType.YET_TO_DELIVER,
        host: {
          id: id,
        },
        car: {
          host: {
            id: id,
          },
        },
      },
      order: {
        created_at: 'DESC',
      },
    });
  }
  async findCompletedHostBooking(id: number) {
    return await this.bookingRepository.find({
      select: {
        status: true,
        address: true,
        start_date: true,
        end_date: true,
        per_day_price: true,
        car: {
          car_name: true,
          vin_number: true,
          model: true,
        },
        driver: {
          first_name: true,
          last_name: true,
        },
      },
      relations: {
        car: true,
        driver: true,
      },
      where: {
        status: In([statusType.COMPLETED, statusType.REJECTED]),
        host: {
          id: id,
        },
        car: {
          host: {
            id: id,
          },
        },
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findDriverBookings(id: number) {
    return await this.bookingRepository.find({
      select: {
        status: true,
        address: true,
        start_date: true,
        end_date: true,
        per_day_price: true,
        host: {
          first_name: true,
          last_name: true,
        },
        car: {
          car_name: true,
          model: true,
          vin_number: true,
        },
      },
      relations: {
        car: true,
        host: true,
      },
      where: {
        status: In([statusType.REQUEST_PROCESSING, statusType.YET_TO_DELIVER]),
        driver: {
          id: id,
        },
      },
      order: {
        created_at: 'DESC',
      },
    });
  }
  async findCompleteDriverBookings(id: number) {
    return await this.bookingRepository.find({
      select: {
        status: true,
        address: true,
        start_date: true,
        end_date: true,
        per_day_price: true,
        host: {
          first_name: true,
          last_name: true,
        },
        car: {
          car_name: true,
          model: true,
          vin_number: true,
        },
      },
      relations: {
        car: true,
        host: true,
      },
      where: {
        status: In([statusType.COMPLETED, statusType.REJECTED]),
        driver: {
          id: id,
        },
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findFutureBookings(startDate: Date, endDate: Date, car_id: number) {
    return await this.bookingRepository.find({
      select: {
        status: true,
        start_date: true,
        end_date: true,
        start_time: true,
        end_time: true,
        id: true,
      },
      relations: {},
      where: {
        start_date: MoreThanOrEqual(new Date()),
        end_date: MoreThanOrEqual(new Date()),
        car: {
          id: car_id,
        },
      },
    });
  }

  //payload validations
  async findOverLapping(start_date: Date, end_date: Date) {
    let response = {
      message: '',
      data: [],
      success: true,
    };

    if (
      new Date(start_date).toISOString() == new Date(end_date).toISOString()
    ) {
      response.message = 'please book car for atleast 24 hours';
      response.success = false;
      return response;
    }

    //checking start date should be less then end date
    if (start_date > end_date) {
      response.message = 'start date must be less then end date';
      response.success = false;
      return response;
    }
    //checking if start date is in future
    if (start_date < new Date()) {
      response.message = 'start date must be of future';
      response.success = false;
      return response;
    }
    return response;
  }

  transformPayload(booking) {
    booking.map((item) => {
      let startDate = item.start_date.toISOString().split('T')[0];
      let endDate = item.end_date.toISOString().split('T')[0];
      item.start_time = moment(
        `${startDate} ${item.start_time}`,
        'YYYY-MM-DD HH:mm',
      );
      item.end_time = moment(`${endDate} ${item.end_time}`, 'YYYY-MM-DD HH:mm');
    });
    return booking;
  }

  async detectOverlap2(
    start_date: Date,
    end_date: Date,
    car_id: number,
    start_time,
    end_time,
  ) {
    let startDate = start_date.toISOString().split('T')[0];
    let endDate = end_date.toISOString().split('T')[0];
    let startTime = moment(`${startDate} ${start_time}`, 'YYYY-MM-DD HH:mm');
    let endTime = moment(`${endDate} ${end_time}`, 'YYYY-MM-DD HH:mm');

    let booking = await this.findFutureBookings(start_date, end_date, car_id);
    if (!booking.length) {
      return true;
    }

    let bookings = this.transformPayload(booking);
    return !bookings.some((booking) => {
      if (
        // 23 to 24 no time check
        (start_date > booking.start_date &&
          start_date < booking.end_date &&
          end_date < booking.end_date &&
          booking.status != statusType.REJECTED) ||
        //23 till 28
        (start_date >= booking.start_date &&
          start_date < booking.end_date &&
          end_date > booking.end_date &&
          booking.status != statusType.REJECTED) ||
        // 18 till 20
        (start_date < booking.start_date &&
          new Date(end_date).toISOString() ==
            new Date(booking.start_date).toISOString() &&
          endTime.isAfter(booking.start_time) &&
          booking.status != statusType.REJECTED) ||
        (end_date > booking.end_date &&
          new Date(start_date).toISOString() ==
            new Date(booking.end_date).toISOString() &&
          startTime.isBefore(booking.end_time) &&
          booking.status != statusType.REJECTED) ||
        (start_date < booking.start_date &&
          end_date > booking.start_date &&
          end_date <= booking.end_date &&
          booking.status != statusType.REJECTED) ||
        (start_date < booking.start_date &&
          end_date > booking.end_date &&
          booking.status != statusType.REJECTED) ||
        (new Date(start_date).toISOString() ==
          new Date(booking.start_date).toISOString() &&
          new Date(end_date).toISOString() ==
            new Date(booking.end_date).toISOString() &&
          booking.status != statusType.REJECTED)
      ) {
        return true;
      }
      return false;
    });
  }
}
