import { JwtService } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { Module } from "@nestjs/common";
import { AuthService } from './auth.service';



@Module({
    imports: [],
    providers: [JwtService, AuthService],
    controllers: [AuthController],
  })
  export class AuthModule {}