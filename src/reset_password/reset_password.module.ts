import { Module } from '@nestjs/common';
import { ResetPasswordService } from './reset_password.service';
import { ResetPasswordController } from './reset_password.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResetPassword } from './entities/reset_password.entity';
import { DriverModule } from 'src/driver/driver.module';
import { DriverService } from 'src/driver/driver.service';
import { Driver } from 'src/driver/entities/driver.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { MailModule } from 'src/mail/mail.module';
import { Host } from 'src/host/entities/host.entity';
import { HostModule } from 'src/host/host.module';
import { HostService } from 'src/host/host.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResetPassword, Driver,Host]),
    DriverModule,
    MailModule,
    HostModule
  ],
  providers: [ResetPasswordService, DriverService, JwtService, MailService,HostService],
  controllers: [ResetPasswordController],
})
export class ResetPasswordModule {}
