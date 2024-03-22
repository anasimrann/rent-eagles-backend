import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/dbconfig';
import { DriverModule } from './driver/driver.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { EmailVerificationModule } from './email_verification/email_verification.module';
import { ResetPasswordModule } from './reset_password/reset_password.module';
import { OtpModule } from './otp/otp.module';
import { S3Module } from './s3/s3.module';
import { ReviewModule } from './driver_reviews/review.module';
import { HostModule } from './host/host.module';
import { CarModule } from './car/car.module';
import { BankModule } from './bank/bank.module';
import { CarReviewsModule } from './car_reviews/car_reviews.module';
import { TripsCompletedModule } from './trips_completed/trips_completed.module';
import { BookingModule } from './booking/booking.module';
import { HostReviewsModule } from './host_reviews/host_reviews.module';
import { PublicModule } from './public/public.module';
import { CronModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminModule } from './admin/admin.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    DriverModule,
    AuthModule,
    MailModule,
    EmailVerificationModule,
    ResetPasswordModule,
    OtpModule,
    S3Module,
    ReviewModule,
    HostModule,
    CarModule,
    BankModule,
    CarReviewsModule,
    TripsCompletedModule,
    BookingModule,
    HostReviewsModule,
    PublicModule,
    CronModule,
    ScheduleModule.forRoot(),
    AdminModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
