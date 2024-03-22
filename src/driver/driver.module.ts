import { MiddlewareConsumer, Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { Driver } from './entities/driver.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverAuthenticationMiddleware } from './middleware/driver.auth.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';
import { EmailVerificationModule } from 'src/email_verification/email_verification.module';
import { EmailVerificationService } from 'src/email_verification/email_verification.service';
import { EmailVerification } from 'src/email_verification/entities/email_verification.entity';
import { OtpModule } from 'src/otp/otp.module';
import { OtpService } from 'src/otp/otp.service';
import { S3Module } from 'src/s3/s3.module';
import { S3Service } from './../s3/s3.service';
import { Review } from 'src/driver_reviews/entities/review.entity';
import { DriverBookingController } from './driverbooking.controller';
import { BookingService } from 'src/booking/booking.service';
import { BookingEntity } from 'src/booking/entities/booking.entity';
import { driverReview } from './driver_review.controller';
import { CarReviewsService } from 'src/car_reviews/car_reviews.service';
import { CarReviewsModule } from 'src/car_reviews/car_reviews.module';
import { CarReviewEntity } from 'src/car_reviews/entities/car_review.entity';
import { HostReviewsModule } from 'src/host_reviews/host_reviews.module';
import { HostReviewsService } from 'src/host_reviews/host_reviews.service';
import { hostReview } from 'src/host_reviews/entity/host_review.entity';
import { TripsCompleted } from 'src/trips_completed/entities/trips_completed.entity';
import { TripsCompletedModule } from 'src/trips_completed/trips_completed.module';
import { TripsCompletedService } from 'src/trips_completed/trips_completed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Driver,
      EmailVerification,
      Review,
      BookingEntity,
      CarReviewEntity,
      hostReview,
      TripsCompleted,
    ]),
    AuthModule,
    EmailVerificationModule,
    MailModule,
    OtpModule,
    S3Module,
    CarReviewsModule,
    HostReviewsModule,
    TripsCompletedModule,
  ],
  providers: [
    DriverService,
    AuthService,
    JwtService,
    MailService,
    EmailVerificationService,
    OtpService,
    S3Service,
    BookingService,
    CarReviewsService,
    HostReviewsService,
    TripsCompletedService,
  ],
  controllers: [DriverController, DriverBookingController, driverReview],
})
export class DriverModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DriverAuthenticationMiddleware).forRoutes('driver/auth/*');
  }
}
