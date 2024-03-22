import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TwilioModule } from "nestjs-twilio";

@Module({
  imports:[
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (cfg: ConfigService) => ({
        accountSid: cfg.get("TWILIO_ACCOUNT_SID"),
        authToken: cfg.get("TWILIO_AUTH_TOKEN"),
      }),
    }),
  ],
  providers: [OtpService]
})
export class OtpModule {}
