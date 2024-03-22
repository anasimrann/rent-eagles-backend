import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TripsCompleted } from './entities/trips_completed.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TripsCompletedService {
  constructor(
    @InjectRepository(TripsCompleted)
    private tripRepository: Repository<TripsCompleted>,
  ) {}

  async findDriverCompletedTripFromCar(driverId: number, carId: number) {
    return await this.tripRepository.findOne({
      select: {},
      relations: {
        car: true,
        driver: true,
      },
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

  async Save(trip: TripsCompleted) {
    return await this.tripRepository.save(trip);
  }
}
