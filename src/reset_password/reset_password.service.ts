import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ClientTypeRESETPASS,
  ResetPassword,
} from './entities/reset_password.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { config } from 'dotenv';
config();

@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>,
    private readonly jwtService: JwtService,
  ) {}

  minuteDifference(date1: Date, date2: Date): number {
    console.log(new Date(), 'asdsadsadsadsad');
    const diffInMilliSeconds = Math.abs(date2.getTime() - date1.getTime());
    const diffInMinutes = Math.floor(diffInMilliSeconds / (1000 * 60));
    console.log(diffInMinutes);
    return diffInMinutes;
  }
  async findOneHost(email: string): Promise<ResetPassword | null> {
    try {
      const user = await this.resetPasswordRepository.findOne({
        where: {
          email: email,
          is_expired: false,
          is_used: false,
          client_type: ClientTypeRESETPASS.HOST,
        },
      });
      if (user) {
        return user;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(`something went bad please try again`);
    }
  }

  async findOneDriver(email: string): Promise<ResetPassword | null> {
    try {
      const user = await this.resetPasswordRepository.findOne({
        where: {
          email: email,
          is_expired: false,
          is_used: false,
          client_type: ClientTypeRESETPASS.DRIVER,
        },
      });
      if (user) {
        return user;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(`something went bad please try again`);
    }
  }

  async save(resetPassword: ResetPassword) {
    return await this.resetPasswordRepository.save(resetPassword);
  }

  async createTokenEntry(): Promise<ResetPassword> {
    const resetPassword = new ResetPassword();
    return resetPassword;
  }

  async findExistChangedHost(email: string) {
    try {
      let existingChangedUser = await this.resetPasswordRepository.findOne({
        where: {
          email: email,
          is_used: true,
          client_type: ClientTypeRESETPASS.HOST,
        },
        order: {
          created_at: 'DESC',
        },
      });

      if (!existingChangedUser) {
        return {
          message: '',
          success: true,
          found: false,
          data: [],
        };
      }

      if (
        this.minuteDifference(existingChangedUser.updated_at, new Date()) < 1440
      ) {
        return {
          message: 'you cannot change password again within 24 hours',
          success: false,
          found: true,
          data: [],
        };
      } else {
        return {
          message: '',
          success: false,
          found: false,
          data: [],
        };
      }
    } catch (err) {
      return {
        message: err.message,
        success: false,
        found: false,
        data: [],
      };
    }
  }

  async findExistChangedDriver(email: string) {
    try {
      let existingChangedUser = await this.resetPasswordRepository.findOne({
        where: {
          email: email,
          is_used: true,
          client_type: ClientTypeRESETPASS.DRIVER,
        },
        order: {
          created_at: 'DESC',
        },
      });

      if (!existingChangedUser) {
        return {
          message: '',
          success: true,
          found: false,
          data: [],
        };
      }

      if (
        this.minuteDifference(existingChangedUser.updated_at, new Date()) < 1440
      ) {
        return {
          message: 'you cannot change password again within 24 hours',
          success: false,
          found: true,
          data: [],
        };
      } else {
        return {
          message: '',
          success: false,
          found: false,
          data: [],
        };
      }
    } catch (err) {
      return {
        message: err.message,
        success: false,
        found: false,
        data: [],
      };
    }
  }

  async generateTokenForResetPassword(email: string, id: string) {
    const token = this.jwtService.sign(
      { email, id },
      {
        secret: process.env.RESET_PASSWORD_SECRET,
        expiresIn: '1h',
      },
    );
    return token;
  }
  async verifyTokenForResetPassword(userToken: string) {
    let token: any;
    try {
      let dbaccesstoken = await this.resetPasswordRepository.findOne({
        where: { token: userToken, is_used: false, is_expired: false },
      });
      console.log(dbaccesstoken, 'dbasdsad');
      if (!dbaccesstoken) {
        return {
          success: false,
          message: 'Your link has expired please try again',
          data: [],
        };
      }
      token = await this.jwtService.verify(dbaccesstoken.token, {
        secret: process.env.RESET_PASSWORD_SECRET,
      });
      if (!token) {
        return {
          success: false,
          message: 'Your link has expired please try again',
          data: [],
        };
      }

      //calculating time. time limit required for verification is 1 hour.
      let updatedTime = dbaccesstoken.updated_at;
      console.log(updatedTime, 'db time');
      console.log(new Date());
      if (this.minuteDifference(updatedTime, new Date()) > 60) {
        return {
          expired: true,
          success: false,
          message: 'your link has been expired please try again',
          data: [],
        };
      } else {
        return {
          success: true,
          message: '',
          data: token,
        };
      }
    } catch (err) {
      if (err.message === 'jwt expired') {
        return {
          expired: true,
          success: false,
          message: 'Your link has expired please try again',
          data: [],
        };
      } else {
        return {
          success: false,
          message: 'Please try again your link has expired',
          data: [],
        };
      }
    }
  }

  async UpdateExpiredToken(token: string) {
    try {
      return await this.resetPasswordRepository.update(
        { token },
        { is_expired: true },
      );
    } catch (err) {
      throw new Error(`something went bad please try again`);
    }
  }

  async UpdateUsedToken(token: string) {
    try {
      return await this.resetPasswordRepository.update(
        { token },
        { is_used: true },
      );
    } catch (err) {
      throw new Error(`something went bad please try again`);
    }
  }

  async userWithMaxAttemptsAndTimeLimitCompleted(user: ResetPassword) {
    let response = {
      message: '',
      success: false,
    };
    let updatedTime = user.updated_at;
    if (this.minuteDifference(updatedTime, new Date()) >= 60) {
      response.message = 'A verification link has been sent your email';
      response.success = true;
    } else {
      response.message =
        'An verification link has already been sent your email. Please Try again in 1 hour.';
      response.success = false;
    }
    return response;
  }
}
