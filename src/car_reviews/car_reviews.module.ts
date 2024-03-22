import { Module } from '@nestjs/common';
import { CarReviewsController } from './car_reviews.controller';
import { CarReviewsService } from './car_reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarReviewEntity } from './entities/car_review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarReviewEntity])],
  controllers: [CarReviewsController],
  providers: [CarReviewsService],
})
export class CarReviewsModule {}
