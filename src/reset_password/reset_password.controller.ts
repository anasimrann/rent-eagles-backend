import { resetPassEmailDTO } from './dto/email.dto';
import { Body, Controller, Post, Req, Res, Param } from '@nestjs/common';
import { Request, Response } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { DriverService } from './../driver/driver.service';
import { ResetPasswordService } from './reset_password.service';
import { MailService } from 'src/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { ResetPasswordDto } from './dto/confirm_passwod.dto';
import { HostService } from 'src/host/host.service';
import { ClientTypeRESETPASS } from './entities/reset_password.entity';

@Controller('password')
export class ResetPasswordController {
  constructor(
    private readonly driverService: DriverService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly mailService: MailService,
    private readonly hostService: HostService,
  ) {}

  @Post('driver/reset')
  async resetPassword(
    @Body() payload: resetPassEmailDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let unique_id = uuidv4();
      const body = plainToClass(resetPassEmailDTO, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (errors && errors.length) {
        return res.status(400).json({
          data: [],
          success: false,
          message: [errorMessages],
        });
      }

      let findUser = await this.driverService.findOne({ email: payload.email });
      if (!findUser) {
        return res.status(200).json({
          success: true,
          data: [],
          message: [
            'An email verification link has been sent to your email if its exist',
          ],
        });
      }

      let alreadyPassChangedUser =
        await this.resetPasswordService.findExistChangedDriver(findUser.email);
      if (alreadyPassChangedUser.found) {
        return res.status(400).json({
          success: alreadyPassChangedUser.success,
          message: [alreadyPassChangedUser.message],
          data: alreadyPassChangedUser.data,
        });
      }

      let alreadyExistUser = await this.resetPasswordService.findOneDriver(
        findUser.email,
      );

      if (alreadyExistUser) {
        if (alreadyExistUser.max_attempts == 3) {
          let userWithMaxAttempts =
            await this.resetPasswordService.userWithMaxAttemptsAndTimeLimitCompleted(
              alreadyExistUser,
            );
          if (!userWithMaxAttempts.success) {
            return res.status(400).json({
              success: false,
              data: [],
              message: [userWithMaxAttempts.message],
            });
          }

          let maxAttemptToken =
            await this.resetPasswordService.generateTokenForResetPassword(
              alreadyExistUser.email,
              alreadyExistUser.unique_id,
            );

          if (!maxAttemptToken) {
            return res.status(400).json({
              success: true,
              data: [],
              message: ['something went wrong'],
            });
          }

          alreadyExistUser.token = maxAttemptToken;
          alreadyExistUser.max_attempts = 1;
          if (!(await this.resetPasswordService.save(alreadyExistUser))) {
            return res.status(400).json({
              success: false,
              data: [],
              message: ['something went wrong'],
            });
          }

          const subject = 'RESET PASSWORD';
          const verificationLink = 'http://localhost:3000/resetPassword/';
          const html = `http://localhost:3000/resetPassword/?token=${maxAttemptToken}`;

          if (
            await this.mailService.sendMail(
              subject,
              html,
              alreadyExistUser.email,
            )
          ) {
            return res.status(200).json({
              success: true,
              data: [],
              message: [
                'An verification link has been sent to your email if its exits',
              ],
            });
          } else {
            return res.status(400).json({
              success: false,
              data: [],
              message: ['Something went wrong try again in few hours.'],
            });
          }
        }

        //increementing max_attempts
        alreadyExistUser.max_attempts = alreadyExistUser.max_attempts + 1;
        let newToken =
          await this.resetPasswordService.generateTokenForResetPassword(
            alreadyExistUser.email,
            alreadyExistUser.unique_id,
          );

        alreadyExistUser.token = newToken;

        if (!(await this.resetPasswordService.save(alreadyExistUser))) {
          return res.status(400).json({
            success: false,
            message: ['something bad occurred. Please Try again'],
            data: [],
          });
        } else {
          const subject = 'RESET PASSWORD';
          const verificationLink = 'http://localhost:3000/resetPassword/';
          const html = `http://localhost:3000/resetPassword/?token=${newToken}`;

          if (await this.mailService.sendMail(subject, html, findUser.email)) {
            return res.status(200).json({
              success: true,
              data: [],
              message: [
                'An verification link has been sent to your email if its exits',
              ],
            });
          } else {
            return res.status(400).json({
              success: false,
              data: [],
              message: ['Something went wrong try again in few hours.'],
            });
          }
        }
      }

      //creating new db entry for first time user
      const dbToken = await this.resetPasswordService.createTokenEntry();
      //setting unique_id,email and max_attempts;
      dbToken.email = payload.email;
      dbToken.unique_id = unique_id;
      dbToken.max_attempts = 1;
      dbToken.client_type = ClientTypeRESETPASS.DRIVER;

      if (!dbToken) {
        return res.status(400).json({
          success: false,
          message: ['Something bad occurred please try again.'],
        });
      }

      //service for generating resetPassword token
      const token =
        await this.resetPasswordService.generateTokenForResetPassword(
          payload.email,
          uuidv4(),
        );

      if (!token) {
        return res.status(400).json({
          success: false,
          message: ['Something bad occurred please try again.'],
          data: [],
        });
      }

      dbToken.token = token;

      let saveAccessToken = await this.resetPasswordService.save(dbToken);

      if (!saveAccessToken) {
        return res.status(400).json({
          message: ['Something bad occurred please try again'],
          data: [],
        });
      }

      const subject = 'RESET PASSWORD';
      const verificationLink = process.env.FRONTEND_RESET_PASSWORD_URL;
      const html = `http://localhost:3000/resetPassword/?token=${token}`;

      if (await this.mailService.sendMail(subject, html, findUser.email)) {
        return res.status(200).json({
          success: true,
          message: [
            'An verification link has been sent to your email if its exits',
          ],
        });
      } else {
        return res.status(400).json({
          success: false,
          message: ['Something went wrong please try again in few hours'],
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: [err.message],
        data: [],
      });
    }
  }

  @Post('driver/verify/:token')
  async verifyResetPassword(
    @Body() payload: ResetPasswordDto,
    @Req() req: Request,
    @Res() res: Response,
    @Param('token') token: string,
  ) {
    try {
      console.log(token);
      const body = plainToClass(ResetPasswordDto, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (payload.password != payload.confirm_password) {
        return res.status(400).json({
          success: false,
          message: ['both password should be same'],
          data: [],
        });
      }
      if (errors && errors.length) {
        return res.status(400).json({
          data: [],
          success: false,
          message: [errorMessages[0]],
        });
      }

      if (!payload.password || !payload.confirm_password) {
        return res.status(400).json({
          success: false,
          message: ['fields cannot be left empty'],
        });
      }

      let verifyToken =
        await this.resetPasswordService.verifyTokenForResetPassword(token);

      if (verifyToken.expired) {
        await this.resetPasswordService.UpdateExpiredToken(token);
        return res.status(400).json({
          success: false,
          message: ['Your link has expired please try again1'],
          data: [],
        });
      }

      if (verifyToken.success == true) {
        let updateuser = await this.driverService.findOne({
          email: verifyToken.data.email,
        });

        if (!updateuser) {
          return res.status(400).json({
            success: true,
            message: ['Your link has expired please try again'],
          });
        }
        let newPassword = await bcrypt.hash(payload.password, 10);
        updateuser.password = newPassword;
        await this.resetPasswordService.UpdateUsedToken(token);
        await this.driverService.save(updateuser);

        return res.status(200).json({
          success: true,
          message: ['Your Password has been changes successfully'],
          data: [],
        });
      }
      return res.status(400).json({
        success: false,
        message: ['Your link has expired please try again'],
        data: [],
      });
    } catch (err) {
      return res.status(500).json({
        success: true,
        message: [err.message],
        data: [],
      });
    }
  }

  @Post('host/reset')
  async resetPasswordDriver(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let unique_id = uuidv4();
      const body = plainToClass(resetPassEmailDTO, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (errors && errors.length) {
        return res.status(400).json({
          data: [],
          success: false,
          message: [errorMessages],
        });
      }

      let findHost = await this.hostService.findOne({ email: payload.email });

      if (!findHost) {
        return res.status(200).json({
          success: true,
          data: [],
          message: [
            'An email verification link has been sent to your email if its exist',
          ],
        });
      }

      //checking host cannot change password again within 24 hours again.
      let alreadyPassChangedHost =
        await this.resetPasswordService.findExistChangedHost(findHost.email);
      if (alreadyPassChangedHost.found) {
        return res.status(400).json({
          success: alreadyPassChangedHost.success,
          data: alreadyPassChangedHost.data,
          message: [alreadyPassChangedHost.message],
        });
      }

      let alreadyExistsHost = await this.resetPasswordService.findOneHost(
        findHost.email,
      );
      console.log(alreadyExistsHost, 'asdsad');
      if (alreadyExistsHost) {
        if (alreadyExistsHost.max_attempts == 3) {
          let maxAttemptHost =
            await this.resetPasswordService.userWithMaxAttemptsAndTimeLimitCompleted(
              alreadyExistsHost,
            );
          if (!maxAttemptHost.success) {
            return res.status(400).json({
              success: false,
              data: [],
              message: [maxAttemptHost.message],
            });
          }

          let maxAttemptToken =
            await this.resetPasswordService.generateTokenForResetPassword(
              alreadyExistsHost.email,
              alreadyExistsHost.unique_id,
            );
          //updating max_attempt host token and max_attempts
          alreadyExistsHost.token = maxAttemptToken;
          alreadyExistsHost.max_attempts = 1;
          //updating in database
          if (!(await this.resetPasswordService.save(alreadyExistsHost))) {
            return res.status(400).json({
              success: false,
              data: [],
              message: ['something went wrong'],
            });
          }
          let subject = 'RESET PASSWORD';
          let verificationLink = '';
          let html = `http://localhost:3000/resetPassword?token=${maxAttemptToken}&type=2`;

          if (
            await this.mailService.sendMail(
              subject,
              html,
              alreadyExistsHost.email,
            )
          ) {
            return res.status(200).json({
              success: true,
              message: [
                'An verification link has been sent to your email if its exits',
              ],
            });
          } else {
            return res.status(400).json({
              success: false,
              message: ['Something went wrong please try again in few hours'],
            });
          }
        }

        //increementing max_attempts and giving new latest token
        alreadyExistsHost.max_attempts = alreadyExistsHost.max_attempts + 1;
        let newToken =
          await this.resetPasswordService.generateTokenForResetPassword(
            alreadyExistsHost.email,
            alreadyExistsHost.unique_id,
          );
        if (!newToken) {
          return res.status(400).json({
            success: false,
            data: [],
            message: ['something went wrong'],
          });
        }
        alreadyExistsHost.token = newToken;

        let subject = 'RESET PASSWORD';
        let verificationLink = '';
        let html = `http://localhost:3000/resetPassword?token=${newToken}&type=2`;

        if (!(await this.resetPasswordService.save(alreadyExistsHost))) {
          return res.status(400).json({
            success: false,
            data: [],
            message: ['something went wrong'],
          });
        }

        if (
          await this.mailService.sendMail(
            subject,
            html,
            alreadyExistsHost.email,
          )
        ) {
          return res.status(200).json({
            success: true,
            message: [
              'An verification link has been sent to your email if its exits',
            ],
          });
        } else {
          return res.status(400).json({
            success: false,
            message: ['Something went wrong please try again in few hours'],
          });
        }
      }

      /***********************HOST IS COMING FIRST TIME FOR CHANGING PASSWORD**************************** */
      const dbToken = await this.resetPasswordService.createTokenEntry();
      //setting unique_id,email and max_attempts;
      dbToken.email = payload.email;
      dbToken.unique_id = unique_id;
      dbToken.max_attempts = 1;
      dbToken.client_type = ClientTypeRESETPASS.HOST;

      if (!dbToken) {
        return res.status(400).json({
          success: false,
          message: ['Something bad occurred please try again.'],
        });
      }

      //service for generating resetPassword token
      const token =
        await this.resetPasswordService.generateTokenForResetPassword(
          payload.email,
          uuidv4(),
        );

      if (!token) {
        return res.status(400).json({
          success: false,
          message: ['Something bad occurred please try again.'],
          data: [],
        });
      }

      dbToken.token = token;

      let saveAccessToken = await this.resetPasswordService.save(dbToken);

      if (!saveAccessToken) {
        return res.status(400).json({
          message: ['Something bad occurred please try again'],
          data: [],
        });
      }

      let subject = 'RESET PASSWORD';
      let verificationLink = '';
      let html = `http://localhost:3000/resetPassword?token=${token}&type=2`;

      if (await this.mailService.sendMail(subject, html, payload.email)) {
        return res.status(200).json({
          success: true,
          message: [
            'An verification link has been sent to your email if its exits',
          ],
        });
      } else {
        return res.status(400).json({
          success: false,
          message: ['Something went wrong please try again in few hours'],
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: true,
        data: [],
        message: [err.message],
      });
    }
  }

  @Post('host/verify/:token')
  async verifyResetPasswordHost(
    @Body() payload: ResetPasswordDto,
    @Req() req: Request,
    @Res() res: Response,
    @Param('token') token: string,
  ) {
    try {
      console.log(payload);
      const body = plainToClass(ResetPasswordDto, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (payload.password != payload.confirm_password) {
        return res.status(400).json({
          success: false,
          message: ['both password should be same'],
          data: [],
        });
      }
      if (errors && errors.length) {
        return res.status(400).json({
          data: [],
          success: false,
          message: [errorMessages[0]],
        });
      }

      if (!payload.password || !payload.confirm_password) {
        return res.status(400).json({
          success: false,
          message: ['fields cannot be left empty'],
        });
      }

      let verifyToken =
        await this.resetPasswordService.verifyTokenForResetPassword(token);

      if (verifyToken.expired) {
        await this.resetPasswordService.UpdateExpiredToken(token);
        return res.status(400).json({
          success: false,
          message: ['Your link has expired please try again'],
          data: [],
        });
      }

      if (verifyToken.success == true) {
        let updatehost = await this.hostService.findOne({
          email: verifyToken.data.email,
        });

        if (!updatehost) {
          return res.status(400).json({
            success: false,
            data: [],
            message: ['Your Link Has Expired'],
          });
        }
        let newPassword = await bcrypt.hash(payload.password, 10);
        updatehost.password = newPassword;
        if (!(await this.hostService.save(updatehost))) {
          return res.status(400).json({
            success: false,
            data: [],
            message: ['something went wrong'],
          });
        }
        await this.resetPasswordService.UpdateUsedToken(token);

        return res.status(200).json({
          success: true,
          data: [],
          message: ['Your Password has been changed successfully'],
        });
      } else {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['Your Link Has Expired'],
        });
      }
    } catch (err) {
      return res.status(500).json({
        success: true,
        data: [],
        message: [err.message],
      });
    }
  }
}
