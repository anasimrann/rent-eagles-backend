import { MiddlewareConsumer, Module } from '@nestjs/common';
import { HostController } from './host.controller';
import { HostService } from './host.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Host } from './entities/host.entity';
import { EmailVerification } from 'src/email_verification/entities/email_verification.entity';
import { Review } from 'src/driver_reviews/entities/review.entity';
import { AuthModule } from 'src/auth/auth.module';
import { EmailVerificationModule } from 'src/email_verification/email_verification.module';
import { OtpModule } from 'src/otp/otp.module';
import { S3Module } from 'nestjs-s3';
import { MailModule } from 'src/mail/mail.module';
import { EmailVerificationService } from 'src/email_verification/email_verification.service';
import { OtpService } from 'src/otp/otp.service';
import { S3Service } from 'src/s3/s3.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { HostAuthenticationMiddleware } from './middleware/host.auth.middleware';
import { MailService } from 'src/mail/mail.service';
import { HostCarController } from './hostcar_controller';
import { BankModule } from 'src/bank/bank.module';
import { BankService } from 'src/bank/bank.service';
import { CarModule } from 'src/car/car.module';
import { CarService } from 'src/car/car.service';
import { BankDetailEntity } from 'src/bank/entities/bank_details.entity';
import { CarDetails } from 'src/car/entities/car.entity';
import { CarReviewsModule } from 'src/car_reviews/car_reviews.module';
import { CarReviewsService } from 'src/car_reviews/car_reviews.service';
import { CarReviewEntity } from 'src/car_reviews/entities/car_review.entity';
import { BookingModule } from 'src/booking/booking.module';
import { BookingEntity } from 'src/booking/entities/booking.entity';
import { BookingService } from 'src/booking/booking.service';
import { hostBookingController } from './hostbooking.controller';
import { hostBankController } from './hostbank_controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Host,
      EmailVerification,
      Review,
      BankDetailEntity,
      CarDetails,
      CarReviewEntity,
      BookingEntity,
      BankDetailEntity,
    ]),
    AuthModule,
    EmailVerificationModule,
    OtpModule,
    S3Module,
    MailModule,
    BankModule,
    CarModule,
    CarReviewsModule,
    BookingModule,
    BankModule,
  ],
  controllers: [
    HostController,
    HostCarController,
    hostBookingController,
    hostBankController,
  ],
  providers: [
    HostService,
    EmailVerificationService,
    OtpService,
    S3Service,
    JwtService,
    AuthService,
    MailService,
    BankService,
    CarService,
    CarReviewsService,
    BookingService,
    BankService,
  ],
})
export class HostModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HostAuthenticationMiddleware).forRoutes('host/auth/*');
  }
}
