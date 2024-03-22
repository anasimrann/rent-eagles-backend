import {
  Controller,
  Req,
  Res,
  Get,
  Body,
  Post,
  Patch,
  Query,
  Param,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DriverService } from 'src/driver/driver.service';
import { Driver } from 'src/driver/entities/driver.entity';
import { HelperService } from 'src/helper_service';
import { S3Service } from 'src/s3/s3.service';

@Controller('admin')
export class adminDriverController {
  constructor(
    private readonly driveService: DriverService,
    private readonly s3Service: S3Service,
  ) {}

  @Get('auth/get/drivers')
  async getAllDriversForAdmin(@Req() req: Request, @Res() res: Response) {
    try {
      let drivers = await this.driveService.findMany(
        {},
        {
          id: true,
          created_at: true,
          first_name: true,
          last_name: true,
          is_approved_to_drive: true,
        },
        {},
      );

      let all_drivers = [];
      for (let i = 0; i < drivers.length; i++) {
        let obj = {};
        obj['id'] = drivers[i].id;
        obj['joined_date'] = HelperService.getJoinedDate(drivers[i].created_at);
        obj['name'] = `${drivers[i].first_name} ${drivers[i].last_name}`;
        obj['status'] = drivers[i].is_approved_to_drive;
        all_drivers.push(obj);
      }
      return res.status(200).json({
        success: true,
        data: all_drivers,
        message: [],
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: [],
        message: [],
      });
    }
  }

  @Get('auth/driver/details/:id')
  async getOneDriverDetail(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      let driver = await this.driveService.findOne(
        { id: id },
        {
          phone_number: true,
          email: true,
          first_name: true,
          last_name: true,
          id: true,
          is_phone_verified: true,
          is_email_verified: true,
          is_approved_to_drive: true,
          liscense_photo: true,
          id_card_photo: true,
          profile_photo: true,
        },
        {},
      );
      if (!driver) {
        return res.status(500).json({
          success: false,
          data: [],
          message: ['something went bad try again'],
        });
      }

      let liscense_photo_url = '';
      let id_card_photo_url = '';
      let profile_photo_url = '';

      if (driver.liscense_photo != null) {
        liscense_photo_url =
          await this.s3Service.getSignedUrlForDriver(liscense_photo_url);
      }
      if (driver.id_card_photo != null) {
        id_card_photo_url =
          await this.s3Service.getSignedUrlForDriver(id_card_photo_url);
      }
      if (driver.profile_photo != null) {
        profile_photo_url =
          await this.s3Service.getSignedUrlForDriver(profile_photo_url);
      }
      let obj = {};
      obj['is_phone_verified'] = driver.is_phone_verified;
      obj['is_email_verified'] = driver.is_email_verified;
      obj['status'] = driver.is_approved_to_drive;
      obj['id'] = driver.id;
      obj['id_card_photo'] = id_card_photo_url;
      obj['profile_photo'] = profile_photo_url;
      obj['liscense_photo'] = liscense_photo_url;
      obj['name'] = driver.first_name + ' ' + driver.last_name;
      obj['email'] = driver.email;
      obj['phone'] = driver.phone_number;

      return res.status(200).json({
        success: true,
        data: obj,
        message: [],
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }

  @Patch('auth/driver/status/:id')
  async updateDriverStatus(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
    @Body() payload: { status: boolean },
  ) {
    try {
      let driver: Driver = await this.driveService.findOne({ id: id });
      if (!driver) {
        return res.status(500).json({
          success: false,
          data: [],
          message: ['something went wrong'],
        });
      }
      driver.is_approved_to_drive = payload.status ? true : false;
      if (!(await this.driveService.save(driver))) {
        return res.status(500).json({
          success: false,
          data: [],
          message: [],
        });
      }
      return res.status(200).json({
        success: true,
        data: [],
        message: ['status updated successfully'],
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }
}
