import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Param,
  UseInterceptors,
  UploadedFiles,
  Put,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BookingService } from 'src/booking/booking.service';
import { BookingEntity } from 'src/booking/entities/booking.entity';
import { CarReviewsService } from 'src/car_reviews/car_reviews.service';
import { CarReviewEntity } from 'src/car_reviews/entities/car_review.entity';
import { HostService } from 'src/host/host.service';
import { hostReview } from 'src/host_reviews/entity/host_review.entity';
import { HostReviewsService } from 'src/host_reviews/host_reviews.service';
import { hostReviewDTO } from './dto/hostReviewDTO.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TripsCompletedService } from 'src/trips_completed/trips_completed.service';
import { driverCarReviewDTO } from './dto/carReviewDTO';

@Controller('driver')
export class driverReview {
  constructor(
    private readonly bookingService: BookingService,
    private readonly carReview: CarReviewsService,
    private readonly hostReviewService: HostReviewsService,
    private readonly tripCompletedService: TripsCompletedService,
  ) {}

  @Get('review/car')
  async driverReview(@Req() req, @Res() res) {
    try {
      //first find if trip is completed and driver hasnt reviewed that particular carid
      let driversTripCompleted: BookingEntity[] =
        await this.bookingService.findDriverCompletedBooking(1);

      let car_review_from_driver = [];
      for (let i = 0; i < driversTripCompleted.length; i++) {
        let existReview: CarReviewEntity;
        existReview = await this.carReview.findDriverReviewForCar(
          driversTripCompleted[i].car.id,
          driversTripCompleted[i].driver.id,
        );
        car_review_from_driver.push(existReview);
      }

      return res.status(200).json({
        success: true,
        data: { driversTripCompleted, car_review_from_driver },
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

  //driver giving review a host.
  @Post('review/host')
  async driverReviewsHost(
    @Body() payload: hostReviewDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const body = plainToClass(hostReviewDTO, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (errors && errors.length) {
        return res.status(422).json({
          data: [],
          success: false,
          message: [errorMessages[0]],
        });
      }
      //first check if driver has already reviewed host
      let existDriver =
        await this.hostReviewService.findHostReviewsFromSingleDriver(1, 1);

      let ifTripCompleted = await this.bookingService.findIfDriverCompletedTrip(
        1,
        1,
      );

      if (!ifTripCompleted) {
        return res.status(422).json({
          success: false,
          data: [],
          message: [
            "You cant review this host,you haven't completed any booking from this host yet",
          ],
        });
      }

      if (existDriver) {
        return res.status(422).json({
          success: false,
          data: [],
          message: ['You already have reviewed this host'],
        });
      }

      //if no review and trip is completed then driver can review
      let review = new hostReview();
      review.description = payload.description;
      review.rating = payload.rating;
      review.host = ifTripCompleted.host;
      review.driver = ifTripCompleted.driver;

      if (!(await this.hostReviewService.Save(review))) {
        return res.status(500).json({
          success: false,
          data: [],
          message: ['something went wrong please try again'],
        });
      }
      return res.status(200).json({
        success: true,
        data: [],
        message: ['Your review is recorded.Thanks for using our platform'],
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }

  //driver giving review to partiuclar car

  @Post('review/car')
  async diverReviewCar(
    @Body() payload: driverCarReviewDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const body = plainToClass(driverCarReviewDTO, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (errors && errors.length) {
        return res.status(422).json({
          data: [],
          success: false,
          message: [errorMessages[0]],
        });
      }
      //first find if driver has already completed trip from that car
      let ifDriverTripCompleted =
        await this.tripCompletedService.findDriverCompletedTripFromCar(1, 1);

      //now find if driver has already reviewed car
      let carId = 1;
      let driverId = 1;
      let existCarRevew = await this.carReview.findDriverReviewForCar(
        carId,
        driverId,
      );
      if (existCarRevew) {
        return res.status(422).json({
          success: false,
          data: [],
          message: ['You already have reviewed this car'],
        });
      }
      if (!ifDriverTripCompleted) {
        return res.status(422).json({
          success: false,
          data: [],
          message: [
            "You cannot review this car,you haven't completed trip from this car",
          ],
        });
      }
      let car_review = new CarReviewEntity();
      car_review.rating = payload.rating;
      car_review.accuracy = payload.accuracy;
      car_review.cleanliness = payload.cleanliness;
      car_review.convenience = payload.convenience;
      car_review.maintenance = payload.maintenance;
      car_review.description = payload.description;
      car_review.communication = payload.communication;
      car_review.car = ifDriverTripCompleted.car;
      car_review.driver = ifDriverTripCompleted.driver;

      if (!(await this.carReview.Save(car_review))) {
        return res.status(422).json({
          success: false,
          data: [],
          message: ['something went wrong'],
        });
      }
      return res.status(200).json({
        success: true,
        data: [],
        message: [
          'You review has been recorded. Thank you for using our platform',
        ],
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
