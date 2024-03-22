import {
  Controller,
  Body,
  Res,
  Post,
  Req,
  Param,
  UseInterceptors,
  UploadedFiles,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HostService } from './host.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/s3/s3.service';
import { CarDetails } from 'src/car/entities/car.entity';
import { BankService } from 'src/bank/bank.service';
import { CarService } from 'src/car/car.service';
import { Host } from './entities/host.entity';
import { CarReviewEntity } from 'src/car_reviews/entities/car_review.entity';
import { CarReviewsService } from 'src/car_reviews/car_reviews.service';
import { BookingService } from 'src/booking/booking.service';

@Controller('host')
export class HostCarController {
  constructor(
    private hostService: HostService,
    private s3Service: S3Service,
    private bankService: BankService,
    private carService: CarService,
    private carReviewService: CarReviewsService,
    private bookingService: BookingService,
  ) {}

  //helper function
  getMonth(created_at) {
    let date = new Date(created_at);
    let month = '';
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((e) => {
      if (date.getMonth() == 0) month = 'Jan';
      if (date.getMonth() == 1) month = 'Feb';
      if (date.getMonth() == 2) month = 'Mar';
      if (date.getMonth() == 3) month = 'Apr';
      if (date.getMonth() == 4) month = 'May';
      if (date.getMonth() == 5) month = 'June';
      if (date.getMonth() == 6) month = 'July';
      if (date.getMonth() == 7) month = 'Aug';
      if (date.getMonth() == 8) month = 'Sep';
      if (date.getMonth() == 9) month = 'Oct';
      if (date.getMonth() == 10) month = 'Nov';
      if (date.getMonth() == 11) month = 'Dec';
    });
    return month;
  }

  //helper function
  getJoinedMonthYear(created_at) {
    let date = new Date(created_at);
    let month = '';
    let year = date.getFullYear();

    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((e) => {
      if (date.getMonth() == 0) month = 'Jan';
      if (date.getMonth() == 1) month = 'Feb';
      if (date.getMonth() == 2) month = 'Mar';
      if (date.getMonth() == 3) month = 'Apr';
      if (date.getMonth() == 4) month = 'May';
      if (date.getMonth() == 5) month = 'June';
      if (date.getMonth() == 6) month = 'July';
      if (date.getMonth() == 7) month = 'Aug';
      if (date.getMonth() == 8) month = 'Sep';
      if (date.getMonth() == 9) month = 'Oct';
      if (date.getMonth() == 10) month = 'Nov';
      if (date.getMonth() == 11) month = 'Dec';
    });
    let join_date = `${month} ${year}`;
    return join_date;
  }

  @Post('auth/list/car/upload/photos')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'photo1',
        maxCount: 1,
      },
      {
        name: 'photo2',
        maxCount: 1,
      },
      {
        name: 'photo3',
        maxCount: 1,
      },
      {
        name: 'photo4',
        maxCount: 1,
      },
      {
        name: 'photo5',
        maxCount: 1,
      },
      {
        name: 'photo6',
        maxCount: 1,
      },
      {
        name: 'photo7',
        maxCount: 1,
      },
      {
        name: 'photo8',
        maxCount: 1,
      },
      {
        name: 'photo9',
        maxCount: 1,
      },
      {
        name: 'photo10',
        maxCount: 1,
      },
    ]),
  )
  async uploadListCarPhotos(
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles()
    car_images: {
      photo1: Express.Multer.File | null;
      photo2: Express.Multer.File | null;
      photo3: Express.Multer.File | null;
      photo4: Express.Multer.File | null;
      photo5: Express.Multer.File | null;
      photo6: Express.Multer.File | null;
      photo7: Express.Multer.File | null;
      photo8: Express.Multer.File | null;
      photo9: Express.Multer.File | null;
      photo10: Express.Multer.File | null;
    },
  ) {
    try {
      console.log(car_images);
      const filesArr = Object.values(car_images)
        .filter((file) => file !== null)
        .flat();

      if (filesArr.length != 10) {
        return res.status(400).json({
          success: true,
          data: [],
          message: ['please upload all images'],
        });
      }

      const validationPromises = filesArr?.map(async (file) => {
        let fileValidation = await this.s3Service.fileValidator(
          file,
          'image',
          1024 * 1024 * 20,
        );

        if (!fileValidation.success) {
          throw new Error(fileValidation.message);
        }
      });

      // Wait for all promises to settle (resolve or reject)
      await Promise.all(validationPromises);

      let car = new CarDetails();
      await Promise.all(
        filesArr?.map(async (file, i) => {
          const carPhotoPath = await this.s3Service.generateFilePath(file);
          car[`photo_${i + 1}`] = carPhotoPath;
          await this.s3Service.uploadToPublicBucket(carPhotoPath, file.buffer);
        }),
      );

      let savedCar = await this.carService.save(car);
      if (!savedCar) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['something went wrong try again'],
        });
      }
      return res.status(200).json({
        success: true,
        data: [{ id: savedCar.id }],
        message: ['success'],
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }

  @Post('auth/list/car/:id')
  async listYourCar(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      console.log(payload);
      let host: Host = req['HOST'];
      let existCar = await this.carService.findOne({
        vin_number: payload.vin_number,
      });
      if (existCar) {
        await this.carService.delete(id);
        return res.status(400).json({
          success: true,
          data: [],
          message: ['car with this vin number already exists'],
        });
      }
      let car = await this.carService.findOne({
        id: id,
      });
      console.log(car);
      if (!car) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['something went wrong'],
        });
      }

      car.address = payload?.address;
      car.car_name = payload?.car_name;
      car.vin_number = payload?.vin_number;
      car.trim = payload?.trim;
      car.style = payload?.style;
      car.distance = payload?.distance;
      car.transmission = payload?.transmission;
      car.vehicle_history = payload?.vehicle_history;
      car.price_per_day = payload?.price;
      car.model = payload?.model;
      if (payload?.salvage == 'true') {
        car.is_salvage = true;
      }
      if (payload?.two_day_minimum == 'true') {
        car.two_day_minimum = true;
      }
      car.is_salvage = false;
      car.liscence_number = payload?.liscence_number;
      car.state_province = payload?.state_province;
      // let carFeatures: string[] = payload?.carFeatures || '[]');
      car.car_features = payload?.carFeatures;

      car.description = payload?.description;
      car.advance_notice = payload?.advance_notice;
      car.min_trip_duration = payload?.minimum_trip_duration;
      car.max_trip_duration = payload?.maximum_trip_duration;

      // saving relations
      car.host = host;

      let newCar = await this.carService.save(car);

      if (!newCar) {
        return res.status(500).json({
          success: false,
          data: [],
          message: ['something went wrong'],
        });
      }

      return res.status(200).json({
        data: [
          {
            car: newCar,
          },
        ],
        message: ['Your car has been listed successfully'],
      });
    } catch (err) {
      console.log(err);
      // if (err?.driverError?.code == 'ER_DUP_ENTRY') {
      //   return res.status(500).json({
      //     success: false,
      //     data: [],
      //     message: ['This vin number alread exists.'],
      //   });
      // }
      return res.status(500).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }

  //display list of cars
  @Get('auth/get/cars')
  async getAllHostCars(@Req() req: Request, @Res() res: Response) {
    try {
      let host: Host = req['HOST'];
      let hostId = host.id;
      let hostCars = await this.hostService.getCars(hostId);
      let carsData = [];

      const promises = hostCars[0].cars.map(async (item: CarDetails, index) => {
        let ratings = 0;
        for (let i = 0; i < item.car_reviews.length; i++) {
          ratings = item.car_reviews[i].rating + ratings;
        }
        let trips_completed =
          item.trips_completed.length > 0 ? item.trips_completed.length : 0;

        let url = await this.s3Service.getSignedUrlPublic(item.photo_1);
        let carsObj = {
          id: item.id,
          name: item.car_name,
          price: item.price_per_day,
          url: url,
          ratings: ratings,
          trips_completed: trips_completed,
        };

        carsData.push(carsObj);
      });

      await Promise.all(promises);

      return res.status(200).json({
        data: carsData,
        data2: hostCars,
      });
    } catch (err) {
      return res.status(400).json({
        data: [err.message],
      });
    }
  }

  /****************************************3 API ROUTES FOR CAR DETAIL******************************************************/
  //get car single car detail and host detail
  @Get('/auth/get/car/:id')
  async getcarDetail(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      //getting host id
      let host: Host = req['HOST'];
      let hostId = host.id;
      //finding host details;
      let findhost = await this.hostService.findHostDetails(hostId);
      let hostDetails = findhost[0];
      let host_joined = this.getJoinedMonthYear(hostDetails.created_at);
      let host_name = `${hostDetails.first_name} ${hostDetails.last_name}`;
      if (hostDetails.profile_photo != null) {
        let url = await this.s3Service.getSignedUrlForDriver(
          hostDetails.profile_photo,
        );
        hostDetails = { ...hostDetails, profile_photo: url };
      }
      let trips_completed = hostDetails?.trips_completed?.length
        ? hostDetails.trips_completed.length
        : 0;
      let average_ratings = 0;

      if (hostDetails.reviews_host.length > 0) {
        for (let i = 0; i < hostDetails.reviews_host.length; i++) {
          average_ratings =
            hostDetails.reviews_host[i].rating + average_ratings;
        }
        average_ratings = average_ratings / hostDetails.reviews_host.length;
      } else {
        average_ratings = 0;
      }

      [
        'first_name',
        'last_name',
        'created_at',
        'trips_completed',
        'reviews_host',
      ].forEach((e) => delete hostDetails[e]);

      let host_details = {
        ...hostDetails,
        average_ratings,
        trips_completed,
        host_name,
        host_joined,
      };

      //first retrieving car_details from car_details table;
      let query_1 = `
        SELECT  
        car_details.id,
        car_features,
        car_details.price_per_day,
        car_details.is_available,
        car_details.model,
        car_details.address,
        car_details.description,
        car_details.vin_number,
        car_details.trim,
        car_details.style,
        car_details.distance,
        car_details.transmission,
        car_details.vehicle_history,
        car_details.is_salvage,
        car_details.liscence_number,
        car_details.state_province,
        car_details.min_trip_duration,
        car_details.max_trip_duration,
        car_details.two_day_minimum,
        car_details.advance_notice,
        car_details.photo_1,
        car_details.photo_2,
        car_details.photo_3,
        car_details.photo_4,
        car_details.photo_5,
        car_details.photo_6,
        car_details.photo_7,
        car_details.photo_8,
        car_details.photo_9,
        car_details.photo_10,
        car_details.car_name
        FROM car_details
        WHERE car_details.id = ${id} AND car_details.hostId = ${hostId}
        `;

      let carDetail = await this.carService.executeQuery(query_1);
      let car_photos = {};
      Object.assign(car_photos, carDetail[0]);

      [
        'id',
        'car_features',
        'car_name',
        'is_available',
        'price_per_day',
        'available',
        'model',
        'distance',
        'address',
        'description',
        'vin_number',
        'trim',
        'style',
        'disance',
        'transmission',
        'vehicle_history',
        'is_salvage',
        'liscence_number',
        'state_province',
        'min_trip_duration',
        'max_trip_duration',
        'two_day_minimum',
        'advance_notice',
      ].forEach((item) => delete car_photos[item]);

      let photos = [];
      for (const key in car_photos) {
        if (car_photos.hasOwnProperty(key)) {
          const photoKey = car_photos[key];
          const signedUrl = await this.s3Service.getSignedUrlPublic(photoKey);
          photos.push({ key, signedUrl });
        }
      }
      let car_details = {};
      Object.assign(car_details, carDetail[0]);

      [
        'photo_1',
        'photo_2',
        'photo_3',
        'photo_4',
        'photo_5',
        'photo_6',
        'photo_7',
        'photo_8',
        'photo_9',
        'photo_10',
      ].forEach((key) => delete car_details[key]);

      return res.status(200).json({
        success: true,
        data: { ...car_details, photos: photos, host_details },
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

  //get single car average ratings maintenance

  @Get('auth/get/car/reviews/:id')
  async getSingleCarReviews(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      let host = req['HOST'];
      let hostId = host.id;
      let carReviews: CarReviewEntity[] =
        await this.carReviewService.findCarReviews(id, hostId);
      let total_ratings = carReviews.length ? carReviews.length : 1;
      let maintenance = 0;
      let cleanliness = 0;
      let accuracy = 0;
      let communication = 0;
      let convenience = 0;
      let ratings = 0;

      //finding average
      if (carReviews.length > 0) {
        for (let i = 0; i < carReviews.length; i++) {
          console.log(carReviews[i].rating);
          maintenance = carReviews[i].maintenance + maintenance;
          cleanliness = carReviews[i].cleanliness + cleanliness;
          accuracy = carReviews[i].accuracy + accuracy;
          communication = carReviews[i].communication + communication;
          convenience = carReviews[i].convenience + convenience;
          ratings = carReviews[i].rating + ratings;
        }
        Math.ceil((ratings = ratings / total_ratings));
        Math.ceil((maintenance = maintenance / total_ratings));
        Math.ceil((cleanliness = cleanliness / total_ratings));
        Math.ceil((accuracy = accuracy / total_ratings));
        Math.ceil((communication = communication / total_ratings));
        Math.ceil((convenience = convenience / total_ratings));
      }

      return res.status(200).json({
        success: true,
        data: [
          {
            ratings,
            maintenance,
            cleanliness,
            accuracy,
            total_ratings,
            convenience,
            communication,
          },
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

  @Get('auth/get/car/driver/reviews/:id')
  async getSingleCarDriverReviews(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      let host: Host = req['HOST'];
      let hostId = host.id;
      let query = `
      SELECT driver.id,
      driver.profile_photo,
      CONCAT(driver.first_name," ",driver.last_name) as driver_name, 
      car_review.description, 
      car_review.rating, 
      car_review.created_at,
      YEAR(car_review.created_at) as year,
      DAY(car_review.created_at) as day
      FROM driver
      JOIN car_review ON driver.id = car_review.driverId
      WHERE car_review.carId = ${id};`;

      let carDriverReviews = await this.carService.executeQuery(query);

      let carReviews = [];

      if (carDriverReviews.length > 0)
        for (let i = 0; i < carDriverReviews.length; i++) {
          let obj = {};
          if (carDriverReviews.profile_photo != null) {
            let profile_photo = await this.s3Service.getSignedUrlForDriver(
              carDriverReviews[i].profile_photo,
            );
            obj['profile_photo'] = profile_photo;
          } else {
            obj['profile_photo'] = null;
          }
          obj['rating'] = carDriverReviews[i].rating;
          (obj['driver_name'] = carDriverReviews[i].driver_name),
            (obj['description'] = carDriverReviews[i].description),
            (obj['created_at'] = `${this.getMonth(
              carDriverReviews[i].created_at,
            )} ${carDriverReviews[i].day},${carDriverReviews[i].year}`);
          carReviews.push(obj);
        }

      return res.status(200).json({
        success: true,
        data: carReviews,
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

  /****************************************3 API ROUTES FOR CAR DETAIL ENDED******************************************************/
  //host history for booking
  // @Get('auth/bookings/:id')
  // async getHostBooking(
  //   @Req() req: Request,
  //   @Res() res: Response,
  //   @Param('id') id: number,
  // ) {
  //   try {
  //     let query = `
  //     SELECT
  //     CONCAT(driver.first_name, ' ', driver.last_name) as full_name,
  //     car_details.vin_number,
  //     car_details.car_name,
  //     car_details.model,
  //     car_details.state_province,
  //     booking.start_date,
  //     booking.end_date,
  //     booking.per_day_price,
  //     booking.status,
  //     booking.driverId,
  //     DATEDIFF(booking.end_date, booking.start_date) as no_of_days,
  //     (DATEDIFF(booking.end_date, booking.start_date) * booking.per_day_price) as total_price
  //     FROM booking
  //     JOIN car_details ON car_details.id = booking.carId
  //     JOIN driver ON driver.id = booking.driverId
  //     WHERE car_details.hostId = ${id} AND (booking.status = 'yet to deliver' OR booking.status = 'process')`;

  //     let bookings = await this.bookingService.executeQuery(query);
  //     return res.status(200).json({
  //       success: true,
  //       data: [bookings],
  //     });
  //   } catch (err) {
  //     return res
  //       .status(500)
  //       .json({ success: false, data: [], message: [err.message] });
  //   }
  // }

  //calendar wise booking
  @Get('auth/get/cars/calendarwise')
  async getCalendarBookings(@Req() req: Request, @Res() res: Response) {
    try {
      let hostId = req['HOST'].id;
      let hostAllBookings =
        await this.bookingService.findAllHostBookings(hostId);

      let host_all_bookings = [];
      for (const item of hostAllBookings) {
        let obj = {};
        obj['car_id']=item.car.id;
        obj['status'] = item.status;
        obj['price_per_day'] = item.car.price_per_day;
        obj['car_name'] = item.car.car_name;
        obj['start_date'] = item.start_date;
        obj['end_date'] = item.end_date;
        obj['photo_1'] = item.car.photo_1
          ? await this.s3Service.getSignedUrlPublic(item.car.photo_1)
          : null;
        obj['trips_completed'] = item.car.trips_completed.length
          ? item.car.trips_completed.length
          : 0;
        let avg_ratings = 0;
        item.car.car_reviews.forEach((review) => {
          avg_ratings += review.rating;
        });
        obj['ratings'] = Math.ceil(avg_ratings / item.car.car_reviews.length);
        host_all_bookings.push(obj);
      }

      return res.status(200).json({
        success: false,
        data: host_all_bookings,
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
