import { Module } from '@nestjs/common';
import { EmailVerificationController } from './email_verification.controller';
import { EmailVerificationService } from './email_verification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerification } from './entities/email_verification.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerification])],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService, JwtService],
})
export class EmailVerificationModule {}
