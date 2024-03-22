import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarReviewEntity } from './entities/car_review.entity';
import { DataSource, Repository } from 'typeorm';
import dataSource from 'src/db/dbconfig';

@Injectable()
export class CarReviewsService {
  constructor(
    @InjectRepository(CarReviewEntity)
    private carReviewRepository: Repository<CarReviewEntity>,
    private dataSource: DataSource,
  ) {}

  async Save(carReview: CarReviewEntity) {
    return await this.carReviewRepository.save(carReview);
  }

  async findCarDetails(query: string) {
    return this.dataSource.query(query);
  }

  async findCarReviews(id: number, hostId: number) {
    return this.carReviewRepository.find({
      relations: {},
      where: {
        car: {
          id: id,
          host: {
            id: hostId,
          },
        },
      },
      select: {
        rating: true,
        cleanliness: true,
        maintenance: true,
        communication: true,
        convenience: true,
        accuracy: true,
      },
    });
  }

  async findDriverReviewForCar(carId: number, driverId: number) {
    return await this.carReviewRepository.findOne({
      select: {},
      where: {
        car: {
          id: carId,
        },
        driver: {
          id: driverId,
        },
      },
    });
  }
}
