import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Param,
  UseInterceptors,
  UploadedFiles,
  Put,
  Get,
} from '@nestjs/common';
// import { Request, Response } from 'express';
import { createDriverDTO } from './dto/createdriver.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { DriverService } from './driver.service';
import { Driver } from './entities/driver.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { loginDriverDTO } from './dto/login.dto';
import { EmailVerificationService } from 'src/email_verification/email_verification.service';
import { MailService } from 'src/mail/mail.service';
import { ClientType } from 'src/email_verification/email_verification.enum';
import { EmailVerification } from 'src/email_verification/entities/email_verification.entity';
import { Request, Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { config } from 'dotenv';
import { OtpService } from 'src/otp/otp.service';
import { approvedDriveDTO } from './dto/approvedtodrive.dto';
import { changeEmailDTO } from './dto/updateEmail.dto';
import { changePasswordDTO } from './dto/changePassword.dto';
import { S3Service } from 'src/s3/s3.service';
import { phoneDTO } from './dto/phoneDTO';
config();

@Controller('driver')
export class DriverController {
  constructor(
    private readonly driverService: DriverService,
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    private readonly s3Service: S3Service,
  ) {}

  //driver signup endpoint
  @Post('signup')
  async signupDriver(@Body() payload: createDriverDTO, @Res() res) {
    try {
      const body = plainToClass(createDriverDTO, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (errors && errors.length) {
        return res.status(400).json({
          data: [],
          success: false,
          message: [errorMessages[0]],
        });
      }

      let existingUser = await this.driverService.findOne({
        email: payload.email,
      });
      if (existingUser) {
        return res.status(400).json({
          data: [],
          success: false,
          message: ['This email is already registered'],
        });
      }

      //creating new driver instance.
      let newDriver = new Driver();

      //hashing password
      const hashPassword = await bcrypt.hash(payload.password, 10);

      //saving values
      newDriver.email = payload.email;
      newDriver.first_name = payload.first_name;
      newDriver.last_name = payload.last_name;
      newDriver.password = hashPassword;
      if (payload.email_notifications) {
        newDriver.is_email_notifications = payload.email_notifications;
      }

      if (!(await this.driverService.save(newDriver))) {
        return res.status(400).json({
          data: [],
          success: false,
          message: ['something went wrong'],
        });
      }

      //creating accesstoken
      let accessToken = await this.authService.generateAccessToken(
        newDriver.id,
      );

      res.header('Authorization', 'Bearer ' + accessToken);
      return res.status(200).json({
        data: [{ accessToken }],
        success: true,
        message: ['you are successfully registered!'],
      });
    } catch (err) {
      return res.status(400).json({
        data: [],
        success: false,
        message: [err.message],
      });
    }
  }

  /**********************************DRIVER LOGIN*********************************** */
  @Post('signin')
  async signinDriver(@Body() payload: loginDriverDTO, @Res() res) {
    try {
      const body = plainToClass(loginDriverDTO, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (errors && errors.length) {
        return res.status(400).json({
          data: [],
          success: false,
          message: [errorMessages[0]],
        });
      }

      //finding user
      let findUser = await this.driverService.findOne({ email: payload.email });

      if (
        findUser &&
        (await bcrypt.compare(payload.password, findUser.password))
      ) {
        //creating accesstoken
        let accessToken = await this.authService.generateAccessToken(
          findUser.id,
        );

        res.header('Authorization', 'Bearer ' + accessToken);
        ['password', 'updated_at'].forEach((e) => delete findUser[e]);
        let month = '';
        let date = new Date(findUser.created_at);
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].forEach((e) => {
          if (date.getMonth() == 0) month = 'Jan';
          if (date.getMonth() == 1) month = 'Feb';
          if (date.getMonth() == 2) month = 'Mar';
          if (date.getMonth() == 3) month = 'Apr';
          if (date.getMonth() == 4) month = 'May';
          if (date.getMonth() == 5) month = 'June';
          if (date.getMonth() == 6) month = 'July';
          if (date.getMonth() == 7) month = 'Aug';
          if (date.getMonth() == 8) month = 'Sep';
          if (date.getMonth() == 9) month = 'Oct';
          if (date.getMonth() == 10) month = 'Nov';
          if (date.getMonth() == 11) month = 'Dec';
        });
        let year = date.getFullYear();
        let join_date = `${month} ${year}`;
        let finduser = { ...findUser, join_date };

        if (findUser.profile_photo != null) {
          let profile_photo_signed_url =
            await this.s3Service.getSignedUrlForDriver(finduser.profile_photo);
          finduser.profile_photo = profile_photo_signed_url;
        }

        if (findUser.id_card_photo != null) {
          let id_card_photo_signed_url =
            await this.s3Service.getSignedUrlForDriver(finduser.id_card_photo);
          finduser.id_card_photo = id_card_photo_signed_url;
        }
        if (findUser.liscense_photo != null) {
          let liscense_photo_signed_url =
            await this.s3Service.getSignedUrlForDriver(finduser.liscense_photo);
          finduser.liscense_photo = liscense_photo_signed_url;
        }

        return res.status(200).json({
          success: true,
          message: ['successfully logged in'],
          data: [{ accessToken, user: finduser }],
        });
      }
      return res.status(404).json({
        success: false,
        message: ['email or password is incorrect'],
        data: [],
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: [err.message],
        data: [],
      });
    }
  }
  /******************************************************/
  // Authenticated Routes for Driver
  //send verification link to registered driver
  @Post('auth/send/verify/email')
  async verifyEmail(@Req() req: Request, @Res() res: Response) {
    try {
      let user: Driver = req['user'];

      let existingToken = await this.emailVerificationService.findOne({
        client_type: ClientType.USER,
        client_id: user.id,
        is_expired: false,
        is_used: false,
      });

      //if user has already request and didnt verified the token
      if (existingToken) {
        if (existingToken.max_attempts == 3) {
          return res.status(400).json({
            success: false,
            message: [
              'An email verification Link has already been sent to you.',
            ],
            data: [],
          });
        }

        existingToken.max_attempts = existingToken.max_attempts + 1;
        let newToken =
          await this.emailVerificationService.generateEmailVerificationToken(
            user.id,
          );
        if (!newToken) {
          return res.status(400).json({
            success: false,
            message: ['Something went wrong'],
            data: [],
          });
        }
        existingToken.token = newToken;
        if (!(await this.emailVerificationService.save(existingToken))) {
          return res.status(400).json({
            success: false,
            message: ['Something went wrong'],
            data: [],
          });
        }
        if (
          !(await this.mailService.sendMail(
            'Verify Your Email',
            `http://localhost:3000/email-verify?token=${newToken}`,
            user.email,
          ))
        ) {
          return res.status(400).json({
            success: false,
            message: ['something went wrong please try again'],
          });
        }
      }

      //user is coming first time
      let email = new EmailVerification();
      email.client_id = user.id;
      email.client_type = ClientType.USER;
      email.max_attempts = 0;

      //generating email verification token.
      let token =
        await this.emailVerificationService.generateEmailVerificationToken(
          user.id,
        );

      email.token = token;
      email.max_attempts = email.max_attempts + 1;

      if (!(await this.emailVerificationService.save(email))) {
        return res.status(400).json({
          success: false,
          message: ['something went wrong please try again'],
        });
      }

      if (
        !(await this.mailService.sendMail(
          'Verify Your Email',
          `http://localhost:3000/email-verify?token=${token}`,
          user.email,
        ))
      ) {
        return res.status(400).json({
          success: false,
          message: ['something went wrong please try again'],
        });
      }
      return res.status(200).json({
        success: true,
        data: [],
        message: ['An email verification link has been sent to your email'],
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
  /***********************************************EMAIL TOKEN VERIFICATION *********************/
  @Post('auth/verify/email/:token')
  async verifyEmailToken(
    @Req() req: Request,
    @Res() res: Response,
    @Param('token') token: string,
  ) {
    try {
      console.log(token);
      let findToken = await this.emailVerificationService.findOne({
        token: token,
        client_type: ClientType.USER,
        is_expired: false,
        is_used: false,
      });

      console.log(findToken);
      if (!findToken) {
        return res.status(400).json({
          success: false,
          message: ['Your email verification link has expired'],
        });
      }

      let emailToken =
        await this.emailVerificationService.verifyEmailVerificationToken(token);
      if (!emailToken) {
        return res.status(400).json({
          success: false,
          message: ['Your email verification link has expired'],
        });
      }

      let driver = await this.driverService.findOne({ id: emailToken.user_id });

      if (!driver) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['Something went wong'],
        });
      }

      driver.is_email_verified = true;
      await this.driverService.save(driver);
      findToken.is_used = true;
      await this.emailVerificationService.save(findToken);
      return res.status(200).json({
        success: true,
        message: ['Your email is verified successfully'],
        data: [],
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: [err.message],
        data: [],
      });
    }
  }

  //SEND OTP
  @Post('auth/send/otp')
  async getOTP(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let user: Driver = req['user'];
      console.log(user);
      if (user.is_phone_verified) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['Your Phone is already verified'],
        });
      }
      let response = await this.otpService.sendOTP(payload.phone);
      if (response.hasError) {
        return res.status(200).json({
          success: false,
          data: [],
          message: [response.message],
        });
      }
      return res.status(200).json({
        success: true,
        data: [],
        message: ['An otp has been sent to your number'],
      });
    } catch (err) {
      return res.status(400).json({
        success: true,
        data: [],
        message: [err.message],
      });
    }
  }

  //DRIVER VERIFY OTP
  @Post('auth/verify/otp')
  async verifyOTP(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let user: Driver = req['user'];
      if (user.is_phone_verified) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['Your Phone is already verified'],
        });
      }
      let response = await this.otpService.verfiyOTP(
        payload.phone,
        payload.otp,
      );

      if (response.hasError) {
        return res.status(400).json({
          succes: false,
          data: [],
          message: [response.message],
        });
      }
      user.is_phone_verified = true;
      user.phone_number = payload.phone;
      let savedUser: Driver = await this.driverService.save(user);
      delete savedUser['password'];
      delete savedUser['liscense_photo'];
      delete savedUser['id_card_photo'];
      delete savedUser['profile_photo'];

      return res.status(200).json({
        success: true,
        data: [{ user: savedUser }],
        message: ['your phone number is verified'],
      });
    } catch (err) {
      return res.status(400).json({
        success: true,
        data: [],
        message: [err.message],
      });
    }
  }

  @Post('auth/approved/drive')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'profile_photo',
        maxCount: 1,
      },
      {
        name: 'liscense_photo',
        maxCount: 1,
      },
      {
        name: 'id_card_photo',
        maxCount: 1,
      },
    ]),
  )
  async getApprovedToDrive(
    @Body() payload: approvedDriveDTO,
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles()
    profile: {
      profile_photo: Express.Multer.File | null;
      liscense_photo: Express.Multer.File | null;
      id_card_photo: Express.Multer.File | null;
    },
  ) {
    try {
      let profile_photo_signed_url;
      let liscense_photo_signed_url;
      let id_card_photo_signed_url;

      let user: Driver = req['user'];
      if (!user.is_phone_verified) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['Please verify your number first'],
        });
      }
      const body = plainToClass(approvedDriveDTO, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (errors && errors.length) {
        return res.status(400).json({
          data: [],
          success: false,
          message: [errorMessages[0]],
        });
      }
      /*********************************************FOR PROFILE PHOTO****************************************/

      /*************************If No picture ***************************/
      if (
        !payload.profile_photo &&
        !profile?.profile_photo?.[0] &&
        !payload.liscense_photo &&
        !profile?.liscense_photo?.[0] &&
        !payload.id_card_photo &&
        !profile?.id_card_photo?.[0]
      ) {
        if (payload.is_mob_notifications == 'true') {
          user.is_mob_notifications = true;
        } else {
          user.is_mob_notifications = false;
        }
        if (payload.is_email_notifications == 'true') {
          user.is_email_notifications = true;
        } else {
          user.is_email_notifications = false;
        }
        if (payload.is_driver_expert == 'true') {
          user.is_driver_expert = true;
        } else {
          user.is_driver_expert = false;
        }

        if (payload.city_state.includes(',')) {
          user.city = payload.city_state.split(',')[0];
          user.state = payload.city_state.split(',')[1];
        }

        let savedUser = await this.driverService.save(user);
        if (!savedUser) {
          return res.status(500).json({
            success: true,
            data: [],
            message: ['something went wrong'],
          });
        }

        delete savedUser['password'];
        let newUser = { ...savedUser };
        return res.status(200).json({
          success: true,
          data: [{ user: newUser }],
          message: ['We will review your request'],
        });
      }
      if (payload.profile_photo && !profile?.profile_photo?.[0]) {
        console.log('hello1');
        profile_photo_signed_url = payload.profile_photo;
      }
      if (!payload.profile_photo && profile?.profile_photo?.[0]) {
        const fileValidation = this.s3Service.fileValidator(
          profile.profile_photo[0],
          'image',
          1024 * 1024 * 20, // 20mb
        );
        if (!fileValidation.success) {
          // Clearing file upload on err
          req.file = undefined;

          return res.status(422).json({
            success: false,
            message: [fileValidation.message],
            data: [],
          });
        }
        //first remove old one
        if (user.profile_photo != null) {
          await this.s3Service.delete(user.profile_photo);
        }
        //generating new file path
        let profile_photo_path = await this.s3Service.generateFilePath(
          profile.profile_photo[0],
        );

        //saving to database;
        user.profile_photo = profile_photo_path;

        //uploading to s3
        await this.s3Service.upload(
          profile_photo_path,
          profile.profile_photo[0].buffer,
        );
        profile_photo_signed_url =
          await this.s3Service.getSignedUrlForDriver(profile_photo_path);
      }

      /*********************************************FOR liscense_photo****************************************/
      // if (!payload.liscense_photo && !profile?.liscense_photo?.[0]) {
      //   return;
      // }
      if (payload.liscense_photo && !profile?.liscense_photo?.[0]) {
        console.log('hello3');
        liscense_photo_signed_url = payload.liscense_photo;
      }

      if (!payload.liscense_photo && profile?.liscense_photo?.[0]) {
        console.log('hello4');
        const fileValidation = this.s3Service.fileValidator(
          profile.liscense_photo[0],
          'image',
          1024 * 1024 * 20, // 20mb
        );
        if (!fileValidation.success) {
          // Clearing file upload on err
          req.file = undefined;

          return res.status(422).json({
            success: false,
            message: [fileValidation.message],
            data: [],
          });
        }
        //first remove old one
        if (user.liscense_photo != null) {
          await this.s3Service.delete(user.liscense_photo);
        }

        //generating new file path
        let liscense_photo_path = await this.s3Service.generateFilePath(
          profile.liscense_photo[0],
        );

        //saving to db
        user.liscense_photo = liscense_photo_path;

        //uploading to s3
        await this.s3Service.upload(
          liscense_photo_path,
          profile.liscense_photo[0].buffer,
        );

        liscense_photo_signed_url =
          await this.s3Service.getSignedUrlForDriver(liscense_photo_path);
      }

      /*********************************************FOR ID_CARD****************************************/
      // if (!payload.id_card_photo && !profile?.id_card_photo?.[0]) {
      //   return;
      // }
      if (payload.id_card_photo && !profile?.id_card_photo?.[0]) {
        id_card_photo_signed_url = payload.id_card_photo;
      }
      if (!payload.id_card_photo && profile?.id_card_photo?.[0]) {
        const fileValidation = this.s3Service.fileValidator(
          profile.id_card_photo[0],
          'image',
          1024 * 1024 * 20, // 20mb
        );
        if (!fileValidation.success) {
          // Clearing file upload on err
          req.file = undefined;

          return res.status(422).json({
            success: false,
            message: [fileValidation.message],
            data: [],
          });
        }

        //first remove old one
        if (user.id_card_photo != null) {
          await this.s3Service.delete(user.id_card_photo);
        }

        //generating new file path
        let id_card_photo_path = await this.s3Service.generateFilePath(
          profile.id_card_photo[0],
        );

        //saving to database

        user.id_card_photo = id_card_photo_path;

        //uploading to s3
        await this.s3Service.upload(
          id_card_photo_path,
          profile.id_card_photo[0].buffer,
        );

        id_card_photo_signed_url =
          await this.s3Service.getSignedUrlForDriver(id_card_photo_path);
      }
      //toggling notifications
      if (payload.is_mob_notifications == 'true') {
        user.is_mob_notifications = true;
      } else {
        user.is_mob_notifications = false;
      }
      if (payload.is_email_notifications == 'true') {
        user.is_email_notifications = true;
      } else {
        user.is_email_notifications = false;
      }
      if (payload.is_driver_expert == 'true') {
        user.is_driver_expert = true;
      } else {
        user.is_driver_expert = false;
      }
      if (payload.city_state.includes(',')) {
        user.city = payload.city_state.split(',')[0];
        user.state = payload.city_state.split(',')[1];
      }

      let savedUser = await this.driverService.save(user);
      if (!savedUser) {
        return res.status(500).json({
          success: true,
          data: [],
          message: ['something went wrong'],
        });
      }

      delete savedUser['password'];

      savedUser.id_card_photo = id_card_photo_signed_url;
      savedUser.profile_photo = profile_photo_signed_url;
      savedUser.liscense_photo = liscense_photo_signed_url;
      let newUser = { ...savedUser };
      return res.status(200).json({
        success: true,
        data: [{ user: newUser }],
        message: ['We will review your request'],
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }

  /**************************CHANGE PASSWORD******************************/
  @Post('auth/change/password')
  async changePassword(
    @Body() payload: changePasswordDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let user: Driver = req['user'];
      let old_password = user.password;

      //old password validations
      if (!(await bcrypt.compare(payload.password, old_password))) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['Your old password is incorrect'],
        });
      }

      //New Password Validation
      if (payload.password != payload.confirm_password) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['New Passwords should match'],
        });
      }

      let newPassword = await bcrypt.hash(payload.password, 10);

      user.password = newPassword;

      if (!(await this.driverService.save(user))) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['Something went wrong'],
        });
      }

      return res.status(200).json({
        success: true,
        data: [],
        message: ['Your Password has been changed successfully'],
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }

  /**************************UPDATE EMAIL******************************/
  @Post('auth/update/email')
  async updateEmail(
    @Body() payload: changeEmailDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let user: Driver = req['user'];
      const body = plainToClass(changeEmailDTO, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (errors && errors.length) {
        return res.status(400).json({
          data: [],
          success: false,
          message: [errorMessages[0]],
        });
      }

      user.email = payload.email;
      user.is_email_verified = false;

      if (!(await this.driverService.save(user))) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['Something went wrong'],
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }
  /**************************UPDATE PHONENO******************************/
  @Put('auth/update/phone')
  async updateHostPhone(
    @Body() payload: phoneDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let driver: Driver = req['user'];
      const body = plainToClass(phoneDTO, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (errors && errors.length) {
        return res.status(400).json({
          data: [],
          success: false,
          message: [errorMessages[0]],
        });
      }

      let findDriver = await this.driverService.findOne({ id: driver.id });
      if (!findDriver) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['something went wrong try again'],
        });
      }

      findDriver.phone_number = payload.phone;
      findDriver.is_phone_verified = false;
      let updatedDriver = await this.driverService.save(findDriver);
      if (!updatedDriver) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['something went wrong try again please '],
        });
      }

      return res.status(200).json({
        success: true,
        message: ['phone number updated successfully'],
        data: [
          {
            is_phone_verified: updatedDriver.is_phone_verified,
            phone_number: payload.phone,
          },
        ],
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }
}
