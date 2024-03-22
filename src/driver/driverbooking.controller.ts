import { Controller, Post, Body, Res, Req, Param, Get } from '@nestjs/common';
import { DriverService } from './driver.service';
import { Request, Response } from 'express';
import { BookingService } from 'src/booking/booking.service';
import { BookingEntity } from 'src/booking/entities/booking.entity';
import * as moment from 'moment';

@Controller('driver')
export class DriverBookingController {
  constructor(
    private readonly driverService: DriverService,
    readonly bookingService: BookingService,
  ) {}

  getDaysBetween(start_date: Date, end_date: Date) {
    var time_difference = end_date.getTime() - start_date.getTime();
    var days = time_difference / (1000 * 60 * 60 * 24);
    return Math.ceil(days);
  }

  @Get('auth/get/booking')
  async driversBooking(@Req() req: Request, @Res() res: Response) {
    try {
      let driverId = req['user'].id;
      let driverBooking: BookingEntity[] =
        await this.bookingService.findDriverBookings(driverId);
      let drivers_bookings = [];
      console.log(driverBooking);

      driverBooking.forEach((booking: BookingEntity, index) => {
        let obj = {};
        obj['No.'] = index + 1;
        obj['status'] = booking.status;
        obj['start_date'] = moment(booking.start_date).format('DD/MMM/YYYY');
        obj['end_date'] = moment(booking.end_date).format('DD/MMM/YYYY');
        obj['per_day_price'] = `$${booking.per_day_price}`;
        const totalPrice =
          booking.per_day_price *
          this.getDaysBetween(booking.start_date, booking.end_date);
        obj['total_price'] = `$${totalPrice.toFixed(2)}`;
        obj['host_name'] =
          `${booking.host?.first_name} ${booking.host?.last_name}`;
        obj['car_name'] = booking.car.car_name;
        obj['car_number'] = booking.car.vin_number;
        obj['model'] = booking.car.model;
        obj['address'] = booking.address;
        drivers_bookings.push(obj);
      });
      return res.status(200).json({
        success: true,
        data: drivers_bookings,
        message: [],
      });
    } catch (err) {
      return res.status(500).json({
        sucess: false,
        data: [],
        message: [err.message],
      });
    }
  }

  @Get('auth/get/booking/completed')
  async driversCompleteBooking(@Req() req: Request, @Res() res: Response) {
    try {
      let driverId = req['user'].id;
      let driverBooking: BookingEntity[] =
        await this.bookingService.findCompleteDriverBookings(driverId);
      let drivers_bookings = [];
      console.log(driverBooking);

      driverBooking.forEach((booking: BookingEntity, index) => {
        let obj = {};
        obj['No.'] = index + 1;
        obj['status'] = booking.status;
        obj['start_date'] = moment(booking.start_date).format('DD/MMM/YYYY');
        obj['end_date'] = moment(booking.end_date).format('DD/MMM/YYYY');
        obj['per_day_price'] = `$${booking.per_day_price}`;
        const totalPrice =
          booking.per_day_price *
          this.getDaysBetween(booking.start_date, booking.end_date);
        obj['total_price'] = `$${totalPrice.toFixed(2)}`;
        obj['host_name'] =
          `${booking.host?.first_name} ${booking.host?.last_name}`;
        obj['car_name'] = booking.car.car_name;
        obj['car_number'] = booking.car.vin_number;
        obj['model'] = booking.car.model;
        obj['address'] = booking.address;
        drivers_bookings.push(obj);
      });
      return res.status(200).json({
        success: true,
        data: drivers_bookings,
        message: [],
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }
}
