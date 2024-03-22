import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from 'nestjs-twilio';
import { TwilioVerificationInstanceStatus } from './twiliostatus';

@Injectable()
export class OtpService {
  public constructor(
    private readonly twilioClient: TwilioService,
    private readonly configService: ConfigService,
  ) {}

  private TWILIO_SID = this.configService.get<string>('TWILIO_SID');
  private twilioService = this.twilioClient?.client?.verify?.v2?.services(
    this.TWILIO_SID,
  );

  //sending OTP SERVICE
  async sendOTP(phoneNumber: string) {
    const response = {
      hasError: false,
      message: '',
    };
    const verificationInstance = await this.twilioService?.verifications.create(
      {
        to: phoneNumber,
        channel: 'sms',
      },
    );
    console.log(verificationInstance);
    if (
      verificationInstance.status === TwilioVerificationInstanceStatus.Canceled
    ) {
      response.hasError = true;
      response.message = 'Something went wrong, please try again later.';
      return response;
    }
    return response;
  }

  //OTP VERIFICATION SERVICE
  async verfiyOTP(phoneNumber: string, code: string) {
    const response = {
      hasError: false,
      message: '',
    };
    const verificationInstance =
      await this.twilioService?.verificationChecks?.create({
        to: phoneNumber,
        code,
      });

    if (
      verificationInstance.status ===
        TwilioVerificationInstanceStatus.Canceled ||
      verificationInstance.status === TwilioVerificationInstanceStatus.Pending
    ) {
      response.hasError = true;
      response.message = 'incorrect OTP';
      return response;
    } else {
      return response;
    }
  }
}
