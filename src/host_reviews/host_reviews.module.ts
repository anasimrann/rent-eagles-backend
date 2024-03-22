import { Module } from '@nestjs/common';
import { HostReviewsController } from './host_reviews.controller';
import { HostReviewsService } from './host_reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { hostReview } from './entity/host_review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([hostReview])],
  controllers: [HostReviewsController],
  providers: [HostReviewsService],
})
export class HostReviewsModule {}
