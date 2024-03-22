import { Controller, Get, Req, Res, Param, Post, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { BookingDTO } from './dto/create_booking.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { BookingService } from './booking.service';
import { CarService } from 'src/car/car.service';
import { BookingEntity } from './entities/booking.entity';
import { HostService } from 'src/host/host.service';
import { DriverService } from 'src/driver/driver.service';

@Controller('booking')
export class BookingController {
  constructor(
    private bookingService: BookingService,
    private carDetailsService: CarService,
    private hostService: HostService,
    private driverService: DriverService,
  ) { }

  @Post('auth/create/booking')
  async createBooking(
    @Body() payload: BookingDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let driverId = req['user'].id;
      console.log(driverId);

      const body = plainToClass(BookingDTO, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (errors && errors.length) {
        return res.status(400).json({
          data: [],
          success: false,
          message: [errorMessages[0]],
        });
      }
      let response = await this.bookingService.findOverLapping(
        payload.start_date,
        payload.end_date,
      );

      if (!response.success) {
        return res.status(422).json({
          success: response.success,
          data: response.data,
          message: [response.message],
        });
      }

      let response2 = await this.bookingService.detectOverlap2(
        payload.start_date,
        payload.end_date,
        payload.carId,
        payload.start_time,
        payload.end_time,
      );
      {
        if (!response2) {
          return res.status(422).json({
            success: response.success,
            data: response.data,
            message: ['booking already exists'],
          });
        }
      }

      //find host details with car
      let host = await this.carDetailsService.findHostWithCarId(payload.carId);
      let driver = await this.driverService.findOne({ id: driverId });
      let findHost = await this.hostService.findOne({ id: host.host.id });
      let car = await this.carDetailsService.findOne({ id: payload.carId });
      let newBooking = new BookingEntity();

      newBooking.start_date = payload.start_date;
      newBooking.end_date = payload.end_date;
      newBooking.start_time = payload.start_time;
      newBooking.end_time = payload.end_time;
      newBooking.address = payload.address;
      newBooking.per_day_price = car.price_per_day;
      newBooking.car = car;
      newBooking.host = findHost;
      newBooking.driver = driver;

      if (!(await this.bookingService.Save(newBooking))) {
        return res.status(500).json({
          data: [],
          message: ['something went wrong'],
          success: true,
        });
      }

      return res.status(200).json({
        data: [],
        message: ['booking is in processing, host will review and confirm'],
        success: true,
      });
    } catch (err) {
      return res.status(500).json({
        data: [],
        message: [err.message],
        success: false,
      });
    }
  }
}
