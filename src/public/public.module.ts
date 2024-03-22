import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { CarService } from 'src/car/car.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarDetails } from 'src/car/entities/car.entity';
import { CarModule } from 'src/car/car.module';
import { Host } from 'src/host/entities/host.entity';
import { HostModule } from 'src/host/host.module';
import { HostService } from 'src/host/host.service';
import { S3Service } from 'src/s3/s3.service';
import { S3Module } from 'src/s3/s3.module';
import { CarReviewsModule } from 'src/car_reviews/car_reviews.module';
import { CarReviewEntity } from 'src/car_reviews/entities/car_review.entity';
import { CarReviewsService } from 'src/car_reviews/car_reviews.service';
import { HostReviewsService } from 'src/host_reviews/host_reviews.service';
import { HostReviewsModule } from 'src/host_reviews/host_reviews.module';
import { hostReview } from 'src/host_reviews/entity/host_review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarDetails, Host, CarReviewEntity, hostReview]),
    CarModule,
    HostModule,
    S3Module,
    CarReviewsModule,
    HostReviewsModule,
  ],
  controllers: [PublicController],
  providers: [
    PublicService,
    CarService,
    HostService,
    S3Service,
    CarReviewsService,
    HostReviewsService,
  ],
})
export class PublicModule {}
