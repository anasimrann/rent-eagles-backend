import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from 'dotenv';
config();

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(user_id: number) {
    return this.jwtService.sign(
      { id: user_id },
      { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '24h' },
    );
  }

  async verifyAccessToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
  }
}
