import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Param,
  Get,
  Patch,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HostService } from './host.service';
import { BookingService } from 'src/booking/booking.service';
import { BookingEntity, statusType } from 'src/booking/entities/booking.entity';
import * as moment from 'moment';
import { HostUpdateBookinDTO } from './dto/host_update_booking.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Controller('host')
export class hostBookingController {
  constructor(
    private hostService: HostService,
    private bookingService: BookingService,
  ) {}

  getDaysBetween(start_date: Date, end_date: Date) {
    var time_difference = end_date.getTime() - start_date.getTime();
    var days = time_difference / (1000 * 60 * 60 * 24);
    return Math.ceil(days);
  }

  @Get('auth/host/booking')
  async gethostBookings(@Req() req: Request, @Res() res: Response) {
    try {
      let hostId = req['HOST'].id;
      let hostBookings: BookingEntity[] =
        await this.bookingService.findHostBookings(hostId);

      let host_bookings = [];
      hostBookings.forEach((booking: BookingEntity, index) => {
        let obj = {};
        obj['start_date'] = obj['No.'] = index + 1;
        obj['status'] = booking.status;
        obj['start_date'] = moment(booking.start_date).format('DD/MMM/YYYY');
        obj['end_date'] = moment(booking.end_date).format('DD/MMM/YYYY');
        obj['per_day_price'] = `$${booking.per_day_price}`;
        const totalPrice =
          booking.per_day_price *
          this.getDaysBetween(booking.start_date, booking.end_date);
        obj['total_price'] = `$${totalPrice.toFixed(2)}`;
        obj['car_name'] = booking.car.car_name;
        obj['make_year'] = booking.car.vin_number;
        obj['car_number'] = booking.car.vin_number;
        obj['Driver'] =
          `${booking.driver.first_name} ${booking.driver.last_name}`;
        obj['location'] = booking.address;
        host_bookings.push(obj);
      });

      return res.status(200).json({
        success: true,
        data: host_bookings,
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

  @Get('auth/completed/booking')
  async gethostCompletedBooking(@Req() req: Request, @Res() res: Response) {
    try {
      let hostId = req['HOST'].id;
      let hostBookings: BookingEntity[] =
        await this.bookingService.findCompletedHostBooking(hostId);

      let host_bookings = [];
      hostBookings.forEach((booking: BookingEntity, index) => {
        let obj = {};
        obj['start_date'] = obj['No.'] = index + 1;
        obj['status'] = booking.status;
        obj['start_date'] = moment(booking.start_date).format('DD/MMM/YYYY');
        obj['end_date'] = moment(booking.end_date).format('DD/MMM/YYYY');
        obj['per_day_price'] = `$${booking.per_day_price}`;
        const totalPrice =
          booking.per_day_price *
          this.getDaysBetween(booking.start_date, booking.end_date);
        obj['total_price'] = `$${totalPrice.toFixed(2)}`;
        obj['car_name'] = booking.car.car_name;
        obj['make_year'] = booking.car.vin_number;
        obj['car_number'] = booking.car.vin_number;
        obj['Driver'] =
          `${booking.driver.first_name} ${booking.driver.last_name}`;
        obj['location'] = booking.address;
        host_bookings.push(obj);
      });

      return res.status(200).json({
        success: true,
        data: host_bookings,
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

  @Get('auth/booking/requests')
  async getBookingRequests(@Req() req: Request, @Res() res: Response) {
    try {
      let hostId = req['HOST'].id;
      let hostBookings: BookingEntity[] =
        await this.bookingService.findHostBookingRequests(hostId);

      let host_bookings = [];
      hostBookings.forEach((booking: BookingEntity, index) => {
        let obj = {};
        obj['id'] = booking.id;
        obj['status'] = booking.status;
        obj['start_date'] = moment(booking.start_date).format('DD/MMM/YYYY');
        obj['end_date'] = moment(booking.end_date).format('DD/MMM/YYYY');
        const totalPrice =
          booking.per_day_price *
          this.getDaysBetween(booking.start_date, booking.end_date);
        obj['total_price'] = `$${totalPrice.toFixed(2)}`;
        obj['car_name'] = booking.car.car_name;
        obj['Driver'] =
          `${booking.driver.first_name} ${booking.driver.last_name}`;
        obj['location'] = booking.address;
        host_bookings.push(obj);
      });

      return res.status(200).json({
        success: true,
        data: host_bookings,
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

  //api for reject or approve booking
  @Patch('auth/actions/booking')
  async approveOrRejectBooking(
    @Body() payload: HostUpdateBookinDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const body = plainToClass(HostUpdateBookinDTO, payload);
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
      if (payload.approved && !payload.reject) {
        if (
          !(await this.bookingService.findOneBookingAndUpdate(
            payload.id,
            statusType.YET_TO_DELIVER,
          ))
        ) {
          return res.status(422).json({
            success: false,
            data: [],
            message: ['something went wrong'],
          });
        }
        return res.status(201).json({
          success: true,
          data: [],
          message: ['booking is approved'],
        });
      }
      if (
        !(await this.bookingService.findOneBookingAndUpdate(
          payload.id,
          statusType.REJECTED,
        ))
      ) {
        return res.status(422).json({
          success: false,
          data: [],
          message: ['something went wrong'],
        });
      }
      return res.status(201).json({
        success: true,
        data: [],
        message: ['booking is rejected'],
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
