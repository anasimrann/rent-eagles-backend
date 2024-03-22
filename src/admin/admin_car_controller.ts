import {
  Controller,
  Req,
  Res,
  Get,
  Body,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CarService } from 'src/car/car.service';
import { S3Service } from 'src/s3/s3.service';

@Controller('admin')
export class AdminCarController {
  constructor(
    private readonly carService: CarService,
    private readonly s3Service: S3Service,
  ) {}

  @Patch('auth/car/list')
  async confirmCar(
    @Req() req: Request,
    @Res() res: Response,
    @Body() payload: { id: number; status: boolean },
  ) {
    try {
      let car = await this.carService.findOne({ id: payload.id });
      if (!car) {
        return res.status(500).json({
          success: false,
          data: [],
          message: ['something went wrong'],
        });
      }
      payload.status ? (car.is_approved = true) : (car.is_approved = false);
      if (!(await this.carService.save(car))) {
        return res.status(500).json({
          success: false,
          data: [],
          message: ['something went wrong'],
        });
      }
      return res.status(200).json({
        success: true,
        data: [],
        message: [
          `${
            payload.status
              ? 'Car Approved Successfully'
              : 'Car Request Rejected'
          }`,
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

  @Get('auth/car/get/all/cars')
  async getAllCars(
    @Req() req: Request,
    @Res() res: Response,
    @Query('skip') skip: number,
    @Query('take') take: number,
  ) {
    try {
      let cars = await this.carService.carsForAdminDashboard(
        {},
        {
          id: true,
          photo_1: true,
          is_approved: true,
          price_per_day: true,
          car_name: true,
          vehicle_type: true,
          vin_number: true,
        },
        {},
        skip,
        take,
      );

      for (let i = 0; i < cars.length; i++) {
        if (cars[i].photo_1 != null) {
          cars[i].photo_1 = await this.s3Service.getSignedUrlPublic(
            cars[i].photo_1,
          );
        }
      }
      return res.status(200).json({
        success: true,
        data: cars,
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
