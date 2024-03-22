import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hostReview } from './entity/host_review.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HostReviewsService {
  constructor(
    @InjectRepository(hostReview)
    private hostReviewRepository: Repository<hostReview>,
  ) {}

  async Save(hostReview: hostReview) {
    return await this.hostReviewRepository.save(hostReview);
  }

  async findHostReviewsFromSingleDriver(hostId: number, driverId: number) {
    return await this.hostReviewRepository.findOne({
      select: {},
      relations: {
        host: true,
        driver: true,
      },
      where: {
        host: {
          id: hostId,
        },
        driver: {
          id: driverId,
        },
      },
    });
  }

  async findHostReviewsFromDrivers(id: number) {
    return await this.hostReviewRepository.find({
      select: {
        rating: true,
        description: true,
        created_at: true,
        driver: {
          profile_photo: true,
          first_name: true,
          last_name: true,
        },
      },
      relations: {
        driver: true,
      },
      where: {
        host: {
          id: id,
        },
      },
    });
  }
}
