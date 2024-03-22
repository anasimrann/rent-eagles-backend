import { Controller, Get, Req, Res, Param, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { CarService } from 'src/car/car.service';
import { CarDetails } from 'src/car/entities/car.entity';
import { CarReviewsService } from 'src/car_reviews/car_reviews.service';
import { CarReviewEntity } from 'src/car_reviews/entities/car_review.entity';
import { HostService } from 'src/host/host.service';
import { hostReview } from 'src/host_reviews/entity/host_review.entity';
import { HostReviewsService } from 'src/host_reviews/host_reviews.service';
import { S3Service } from 'src/s3/s3.service';

@Controller('public')
export class PublicController {
  constructor(
    private carDetailsService: CarService,
    private hostService: HostService,
    private s3Service: S3Service,
    private carReviewService: CarReviewsService,
    private hostReviewService: HostReviewsService,
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

  getDayFromDate(created_at) {
    let date = new Date(created_at);
    return date.getDate();
  }
  getYearFromDate(created_at) {
    let date = new Date(created_at);
    return date.getFullYear();
  }
  /******************************************************************************************CAR PUBLIC ROUTES******************************************/
  @Get('get/car/:id')
  async getCarDetails(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      //first find hostdetails;
      let host = await this.carDetailsService.findHostWithCarId(id);
      let findhost = await this.hostService.findHostDetails(host['host'].id);
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
        'is_email_verified',
        'is_phone_verified',
        'city',
        'state',
      ].forEach((e) => delete hostDetails[e]);

      let host_details = {
        ...hostDetails,
        average_ratings,
        trips_completed,
        host_name,
        host_joined,
        id: host['host'].id,
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
        WHERE car_details.id = ${id} AND car_details.hostId = ${host['host'].id}
        `;

      let carDetail = await this.carDetailsService.executeQuery(query_1);
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

  @Get('get/car/reviews/:id')
  async getSingleCarReviews(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      //first find hostdetails;
      let host = await this.carDetailsService.findHostWithCarId(id);
      let carReviews: CarReviewEntity[] =
        await this.carReviewService.findCarReviews(id, host['host'].id);
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

  @Get('get/car/driver/reviews/:id')
  async getSingleCarDriverReviews(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
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

      let carDriverReviews = await this.carDetailsService.executeQuery(query);

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

  //route for get all cars

  @Get('get/all/cars')
  async getAllCars(@Req() req: Request, @Res() res: Response) {
    try {
      let cars = await this.carDetailsService.findMany(
        {},
        {
          id: true,
          photo_1: true,
          car_name: true,
          price_per_day: true,
          address: true,
          green_vehicle: true,
          number_of_seats: true,
          brand: true,
          vehicle_type: true,
          car_features: true,
          transmission: true,
        },
      );
      let cars_data = [];
      for (let i = 0; i < cars.length; i++) {
        let obj = {};
        obj['id'] = cars[i].id;
        obj['photo'] = await this.s3Service.getSignedUrlPublic(cars[i].photo_1);
        obj['price_per_day'] = cars[i].price_per_day;
        obj['car_name'] = cars[i].car_name;
        obj['address'] = cars[i].address;
        obj['brand'] = cars[i].brand;
        obj['car_features'] = cars[i].car_features;
        obj['green_vehicle'] = cars[i].green_vehicle;
        obj['vehicle_type'] = cars[i].vehicle_type;
        obj['number_of_seats'] = cars[i].number_of_seats;
        obj['transmission'] = cars[i].transmission;
        cars_data.push(obj);
      }
      return res.status(200).json({
        success: true,
        data: cars_data,
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

  //route for fetch cars based brands
  @Get('get/car/by/brand/:brand')
  async getCarsByBrandName(
    @Req() req: Request,
    @Res() res: Response,
    @Param('brand') brand: string,
  ) {
    try {
      let cars = await this.carDetailsService.findMany(
        { brand: brand },
        { id: true, photo_1: true, price_per_day: true },
        { trips_completed: true, car_reviews: true },
      );

      let cars_by_brand = [];
      for (let i = 0; i < cars.length; i++) {
        let obj = {};
        obj['car_id'] = cars[i].id;
        obj['car_photo'] = cars[i].photo_1
          ? await this.s3Service.getSignedUrlPublic(cars[i].photo_1)
          : null;
        obj['price_per_day'] = cars[i].price_per_day;
        obj['trips_completed'] = cars[i].trips_completed.length
          ? cars[i].trips_completed.length
          : 0;
        let avg_ratings = 0;

        if (cars[i].car_reviews.length) {
          cars[i].car_reviews.forEach((item) => {
            avg_ratings = item.rating + avg_ratings;
          });
          avg_ratings = Math.ceil(avg_ratings / cars[i].car_reviews.length);
        } else {
          avg_ratings = 0;
        }
        obj['rating'] = avg_ratings;
        obj['trips_completed'] = cars[i].trips_completed.length
          ? cars[i].trips_completed.length
          : 0;
        cars_by_brand.push(obj);
      }
      cars_by_brand.sort((a, b) => b.rating - a.rating);

      return res.status(200).json({
        success: false,
        data: cars_by_brand,
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

  @Get('get/car/by/vehicle/type/:type')
  async getCarsByVehicleType(@Req() req: Request, @Res() res: Response) {
    try {
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }

  /***************************************************************************HOST PUBLIC ROUTES DETAILS*************************************************/
  @Get('host/profile/:id')
  async getHostProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      let findhost = await this.hostService.findHostDetails(id);
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
      return res.status(200).json({
        success: true,
        message: [],
        data: [host_details],
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }

  @Get('host/get/cars/:id')
  async getAllHostCars(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      let hostCars = await this.hostService.getCars(id);
      let carsData = [];

      const promises = hostCars[0].cars.map(async (item: CarDetails, index) => {
        let ratings = 0;
        for (let i = 0; i < item.car_reviews.length; i++) {
          ratings = item.car_reviews[i].rating + ratings;
        }
        Math.floor((ratings = ratings / item?.car_reviews?.length));
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
      });
    } catch (err) {
      return res.status(400).json({
        data: [err.message],
      });
    }
  }

  @Get('host/reviews/:id')
  async getHostReviewsFromDrivers(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      const reviews: hostReview[] =
        await this.hostReviewService.findHostReviewsFromDrivers(id);

      let host_reviews = [];

      for (let i = 0; i < reviews.length; i++) {
        let obj = {};
        obj['description'] = reviews[i]?.description;
        obj['rating'] = reviews[i]?.rating;
        obj['date'] = `${this.getMonth(
          reviews[i]?.created_at,
        )} ${this.getDayFromDate(
          reviews[i].created_at,
        )}, ${this.getYearFromDate(reviews[i]?.created_at)}`;
        obj['name'] =
          `${reviews[i]?.driver?.first_name} ${reviews[i]?.driver?.last_name}`;
        if (reviews[i].driver.profile_photo != null) {
          obj['profile_photo'] = await this.s3Service.getSignedUrlForDriver(
            reviews[i].driver.profile_photo,
          );
        }
        obj['profile_photo'] = null;
        host_reviews.push(obj);
      }

      return res.status(200).json({
        success: true,
        data: host_reviews,
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
