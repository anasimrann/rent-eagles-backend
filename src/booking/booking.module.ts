import { Module, MiddlewareConsumer } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from './entities/booking.entity';
import { AuthService } from 'src/auth/auth.service';
import { DriverService } from 'src/driver/driver.service';
import { Driver } from 'src/driver/entities/driver.entity';
import { DriverModule } from 'src/driver/driver.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DriverAuthenticationMiddleware } from 'src/driver/middleware/driver.auth.middleware';
import { CarService } from 'src/car/car.service';
import { CarModule } from 'src/car/car.module';
import { CarDetails } from 'src/car/entities/car.entity';
import { HostService } from 'src/host/host.service';
import { Host } from 'src/host/entities/host.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingEntity, Driver,CarDetails,Host]),
    DriverModule,
    AuthModule,
    JwtModule,
    CarModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, AuthService, DriverService,JwtService,CarService,HostService],
})
export class BookingModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DriverAuthenticationMiddleware).forRoutes('booking/auth/*');
  }
}
