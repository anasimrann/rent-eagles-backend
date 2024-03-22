import {
  Controller,
  Body,
  Res,
  Post,
  Req,
  Param,
  UseInterceptors,
  UploadedFiles,
  Put,
  Get,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { createHostDTO } from './dto/createhost.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { HostService } from './host.service';
import { Host } from './entities/host.entity';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { hostLoginDTO } from './dto/hostLogin.dto';
import { S3Service } from 'src/s3/s3.service';
import { Request, Response } from 'express';
import { EmailVerificationService } from 'src/email_verification/email_verification.service';
import { ClientType } from 'src/email_verification/email_verification.enum';
import { MailService } from 'src/mail/mail.service';
import { EmailVerification } from 'src/email_verification/entities/email_verification.entity';
import { OtpService } from 'src/otp/otp.service';
import { ListToDriveDTO } from './dto/listyourcar.dto';
import { phoneDTO } from './dto/phone_dto';

@Controller('host')
export class HostController {
  constructor(
    private readonly hostService: HostService,
    private readonly authService: AuthService,
    private readonly s3Service: S3Service,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
  ) {}

  @Post('signup')
  async signupDriver(@Body() payload: createHostDTO, @Res() res) {
    try {
      const body = plainToClass(createHostDTO, payload);
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

      let existingUser = await this.hostService.findOne({
        email: payload.email,
      });
      if (existingUser) {
        return res.status(400).json({
          data: [],
          success: false,
          message: ['This email is already registered'],
        });
      }

      //creating new host instance
      let newHost = new Host();

      //hashing password
      const hashPassword = await bcrypt.hash(payload.password, 10);

      //saving values
      newHost.email = payload.email;
      newHost.first_name = payload.first_name;
      newHost.last_name = payload.last_name;
      newHost.password = hashPassword;
      if (payload.email_notifications) {
        newHost.is_email_notifications = payload.email_notifications;
      }

      if (!(await this.hostService.save(newHost))) {
        return res.status(400).json({
          data: [],
          success: false,
          message: ['something went wrong'],
        });
      }

      //creating accesstoken
      let accessToken = await this.authService.generateAccessToken(newHost.id);

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
  async signinDriver(@Body() payload: hostLoginDTO, @Res() res) {
    try {
      const body = plainToClass(hostLoginDTO, payload);
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
      let host = await this.hostService.findOne({ email: payload.email });

      if (host && (await bcrypt.compare(payload.password, host.password))) {
        //creating accesstoken
        let accessToken = await this.authService.generateAccessToken(host.id);

        res.header('Authorization', 'Bearer ' + accessToken);
        ['password', 'updated_at'].forEach((e) => delete host[e]);
        let month = '';
        let date = new Date(host.created_at);
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
        let findhost = { ...host, join_date };

        if (findhost.profile_photo != null) {
          let profile_photo_signed_url =
            await this.s3Service.getSignedUrlForDriver(findhost.profile_photo);
          findhost.profile_photo = profile_photo_signed_url;
        }

        if (findhost.id_card_photo != null) {
          let id_card_photo_signed_url =
            await this.s3Service.getSignedUrlForDriver(findhost.id_card_photo);
          findhost.id_card_photo = id_card_photo_signed_url;
        }
        if (findhost.liscense_photo != null) {
          let liscense_photo_signed_url =
            await this.s3Service.getSignedUrlForDriver(findhost.liscense_photo);
          findhost.liscense_photo = liscense_photo_signed_url;
        }
        if (findhost.insurance_card_photo != null) {
          let insurance_photo_signed_url =
            await this.s3Service.getSignedUrlForDriver(
              findhost.insurance_card_photo,
            );
          findhost.insurance_card_photo = insurance_photo_signed_url;
        }
        if (findhost.registration_card_photo != null) {
          let registration_photo_signed_url =
            await this.s3Service.getSignedUrlForDriver(
              findhost.registration_card_photo,
            );
          findhost.registration_card_photo = registration_photo_signed_url;
        }

        return res.status(200).json({
          success: true,
          message: ['successfully logged in'],
          data: [{ accessToken, user: findhost }],
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
      let host: Host = req['HOST'];

      let existingToken = await this.emailVerificationService.findOne({
        client_type: ClientType.HOST,
        client_id: host.id,
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
            host.id,
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
            `http://localhost:3000/email-verify?token=${newToken}&type=2`,
            host.email,
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
      email.client_id = host.id;
      email.client_type = ClientType.HOST;
      email.max_attempts = 0;

      //generating email verification token.
      let token =
        await this.emailVerificationService.generateEmailVerificationToken(
          host.id,
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
          `http://localhost:3000/email-verify?token=${token}&type=2`,
          host.email,
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
      let findToken = await this.emailVerificationService.findOne({
        token: token,
        client_type: ClientType.HOST,
        is_expired: false,
        is_used: false,
      });
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
      let host = await this.hostService.findOne({ id: emailToken.user_id });
      if (!host) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['Something went wong'],
        });
      }
      host.is_email_verified = true;
      await this.hostService.save(host);
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

  //HOST SEND OTP
  @Post('auth/send/otp')
  async getOTP(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let host: Host = req['HOST'];
      if (host.is_phone_verified) {
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

  //HOST VERIFY OTP
  @Post('auth/verify/otp')
  async verifyOTP(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let host: Host = req['HOST'];
      if (host.is_phone_verified) {
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
      host.is_phone_verified = true;
      host.phone_number = payload.phone;
      let savedUser: Host = await this.hostService.save(host);
      delete savedUser['password'];
      delete savedUser['id_card_photo'];
      delete savedUser['registration_card_photo'];
      delete savedUser['profile_photo'];
      delete savedUser['insurance_card_photo'];
      delete savedUser['liscense_photo'];

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

  @Post('auth/get/approved/list/car')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'profile_photo',
        maxCount: 1,
      },
      {
        name: 'id_card_photo',
        maxCount: 1,
      },
      {
        name: 'liscense_photo',
        maxCount: 1,
      },
      {
        name: 'registration_card_photo',
        maxCount: 1,
      },
      {
        name: 'insurance_card_photo',
        maxCount: 1,
      },
    ]),
  )
  async getApprovedToListCar(
    @Body() payload: ListToDriveDTO,
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles()
    profile: {
      profile_photo: Express.Multer.File | null;
      id_card_photo: Express.Multer.File | null;
      liscense_photo: Express.Multer.File | null;
      registration_card_photo: Express.Multer.File | null;
      insurance_card_photo: Express.Multer.File | null;
    },
  ) {
    try {
      let profile_photo_signed_url = null;
      let liscense_photo_signed_url = null;
      let id_card_photo_signed_url = null;
      let registration_card_photo_signed_url = null;
      let insurance_card_photo_signed_url = null;

      let host: Host = req['HOST'];
      if (!host.is_phone_verified) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['Please verify your number first'],
        });
      }

      const body = plainToClass(ListToDriveDTO, payload);
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
      if (
        !payload.profile_photo &&
        !profile?.profile_photo?.[0] &&
        !payload.id_card_photo &&
        profile?.id_card_photo?.[0] &&
        !payload.insurance_card_photo &&
        profile?.insurance_card_photo?.[0] &&
        !payload.liscense_photo &&
        profile?.liscense_photo?.[0] &&
        !payload.registration_card_photo &&
        profile?.registration_card_photo?.[0]
      ) {
        if (payload.is_mob_notifications == 'true') {
          host.is_mob_notifications = true;
        } else {
          host.is_mob_notifications = false;
        }
        if (payload.is_email_notifications == 'true') {
          host.is_email_notifications = true;
        } else {
          host.is_email_notifications = false;
        }
        if (payload.is_driver_expert == 'true') {
          host.is_host_expert = true;
        } else {
          host.is_host_expert = false;
        }
        if (payload.city_state) {
          if (payload.city_state.includes(',')) {
            (host.city = payload.city_state.split(',')[0]),
              (host.state = payload.city_state.split(',')[1]);
          }
        }

        let savedUser = await this.hostService.save(host);
        console.log(savedUser, 'asdasd');
        if (!savedUser) {
          return res.status(500).json({
            success: true,
            data: [],
            message: ['something went wrong'],
          });
        }
        delete savedUser['password'];
        return res.status(200).json({
          success: true,
          data: [{ user: savedUser }],
          message: ['We will review your request'],
        });
      }

      /**************************PROFILE PHOTO*************************** */
      if (payload.profile_photo && !profile?.profile_photo?.[0]) {
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
        if (host.profile_photo != null) {
          await this.s3Service.delete(host.profile_photo);
        }

        //generating new file path
        let profile_photo_path = await this.s3Service.generateFilePath(
          profile.profile_photo[0],
        );

        //saving to database;
        host.profile_photo = profile_photo_path;

        //uploading to s3
        await this.s3Service.upload(
          profile_photo_path,
          profile.profile_photo[0].buffer,
        );
        profile_photo_signed_url =
          await this.s3Service.getSignedUrlForDriver(profile_photo_path);
      }

      /*******************************LISCENSE PHOTO *******************************************/
      if (payload.liscense_photo && !profile?.liscense_photo?.[0]) {
        liscense_photo_signed_url = payload.liscense_photo;
      }

      if (!payload.liscense_photo && profile?.liscense_photo?.[0]) {
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
        if (host.liscense_photo != null) {
          await this.s3Service.delete(host.liscense_photo);
        }

        //generating new file path
        let liscense_photo_path = await this.s3Service.generateFilePath(
          profile.liscense_photo[0],
        );

        //saving to db
        host.liscense_photo = liscense_photo_path;

        //uploading to s3
        await this.s3Service.upload(
          liscense_photo_path,
          profile.liscense_photo[0].buffer,
        );

        liscense_photo_signed_url =
          await this.s3Service.getSignedUrlForDriver(liscense_photo_path);
      }

      /*********************************************FOR ID_CARD****************************************/
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
        if (host.id_card_photo != null) {
          await this.s3Service.delete(host.id_card_photo);
        }

        //generating new file path
        let id_card_photo_path = await this.s3Service.generateFilePath(
          profile.id_card_photo[0],
        );

        //saving to database

        host.id_card_photo = id_card_photo_path;

        //uploading to s3
        await this.s3Service.upload(
          id_card_photo_path,
          profile.id_card_photo[0].buffer,
        );

        id_card_photo_signed_url =
          await this.s3Service.getSignedUrlForDriver(id_card_photo_path);
      }

      /**************************FOR REGISTRATION CARD PHOTO **************************************** */

      if (
        payload.registration_card_photo &&
        !profile?.registration_card_photo?.[0]
      ) {
        registration_card_photo_signed_url = payload.registration_card_photo;
      }
      if (
        !payload.registration_card_photo &&
        profile?.registration_card_photo?.[0]
      ) {
        const fileValidation = this.s3Service.fileValidator(
          profile.registration_card_photo[0],
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
        if (host.registration_card_photo != null) {
          await this.s3Service.delete(host.registration_card_photo);
        }

        //generating new file path
        let registration_card_photo_path =
          await this.s3Service.generateFilePath(
            profile.registration_card_photo[0],
          );

        //saving to database
        host.registration_card_photo = registration_card_photo_path;

        await this.s3Service.upload(
          registration_card_photo_path,
          profile.registration_card_photo[0].buffer,
        );

        registration_card_photo_signed_url =
          await this.s3Service.getSignedUrlForDriver(
            host.registration_card_photo,
          );
      }

      /**************************FOR INSURANCE CARD PHOTO **************************************** */

      if (payload.insurance_card_photo && !profile?.insurance_card_photo?.[0]) {
        insurance_card_photo_signed_url = payload.insurance_card_photo;
      }
      if (!payload.insurance_card_photo && profile?.insurance_card_photo?.[0]) {
        const fileValidation = this.s3Service.fileValidator(
          profile.insurance_card_photo[0],
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
        if (host.insurance_card_photo != null) {
          await this.s3Service.delete(host.insurance_card_photo);
        }

        //generating new file path
        let insurance_card_photo_path = await this.s3Service.generateFilePath(
          profile.insurance_card_photo[0],
        );

        //saving to database
        host.insurance_card_photo = insurance_card_photo_path;

        await this.s3Service.upload(
          insurance_card_photo_path,
          profile.insurance_card_photo[0].buffer,
        );

        insurance_card_photo_signed_url =
          await this.s3Service.getSignedUrlForDriver(
            host.registration_card_photo,
          );
      }

      console.log('geloooooooo2');
      //toggling notifications
      if (payload.is_mob_notifications == 'true') {
        host.is_mob_notifications = true;
      } else {
        host.is_mob_notifications = false;
      }
      if (payload.is_email_notifications == 'true') {
        host.is_email_notifications = true;
      } else {
        host.is_email_notifications = false;
      }
      if (payload.is_driver_expert == 'true') {
        host.is_host_expert = true;
      } else {
        host.is_host_expert = false;
      }
      if (payload.city_state) {
        if (payload.city_state.includes(',')) {
          host.city = payload.city_state.split(',')[0];
          host.state = payload.city_state.split(',')[1];
        }
      }
      let savedUser = await this.hostService.save(host);

      if (!savedUser) {
        return res.status(500).json({
          success: true,
          data: [],
          message: ['something went wrong'],
        });
      }

      delete savedUser['password'];
      let newUser = {
        ...savedUser,
        id_card_photo: id_card_photo_signed_url,
        liscense_photo: liscense_photo_signed_url,
        registration_card_photo: registration_card_photo_signed_url,
        profile_photo: profile_photo_signed_url,
        insurance_card_photo: insurance_card_photo_signed_url,
      };

      return res.status(200).json({
        success: true,
        data: [{ user: newUser }],
        message: ['We will review your request'],
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }

  @Put('auth/update/phone')
  async updateHostPhone(
    @Body() payload: phoneDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let host: Host = req['HOST'];
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

      let findHost = await this.hostService.findOne({ id: host.id });
      if (!findHost) {
        return res.status(400).json({
          success: false,
          data: [],
          message: ['something went wrong try again'],
        });
      }

      findHost.phone_number = payload.phone;
      findHost.is_phone_verified = false;
      let updatedHost = await this.hostService.save(findHost);
      if (!updatedHost) {
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
            is_phone_verified: updatedHost.is_phone_verified,
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
