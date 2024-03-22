import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { adminMiddleware } from './middleware/admin.middleware';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from './entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import { adminHostController } from './adminhost_controller';
import { HostModule } from 'src/host/host.module';
import { HostService } from 'src/host/host.service';
import { Host } from 'src/host/entities/host.entity';
import { S3Service } from 'src/s3/s3.service';
import { DriverModule } from 'src/driver/driver.module';
import { CarModule } from 'src/car/car.module';
import { Driver } from 'src/driver/entities/driver.entity';
import { CarDetails } from 'src/car/entities/car.entity';
import { CarService } from 'src/car/car.service';
import { DriverService } from 'src/driver/driver.service';
import { adminDashBoardController } from './admin_dashboard_controller';
import { AdminCarController } from './admin_car_controller';
import { adminDriverController } from './admin_driver_controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminEntity, Host, Driver, CarDetails]),
    AuthModule,
    HostModule,
    DriverModule,
    CarModule,
  ],
  providers: [
    AdminService,
    AuthService,
    JwtService,
    HostService,
    S3Service,
    CarService,
    DriverService,
  ],
  controllers: [
    AdminController,
    adminHostController,
    adminDashBoardController,
    AdminCarController,
    adminDriverController,
  ],
})
export class AdminModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(adminMiddleware).forRoutes('admin/auth/*');
  }
}
