import { Body, Controller, Get, Req, Res, Param, Patch } from '@nestjs/common';
import { Request, Response } from 'express';
import { HelperService } from 'src/helper_service';
import { Host } from 'src/host/entities/host.entity';
import { HostService } from 'src/host/host.service';
import { S3Service } from 'src/s3/s3.service';

@Controller('admin')
export class adminHostController {
  constructor(
    private readonly hostService: HostService,
    private readonly s3Service: S3Service,
  ) {}

  @Get('auth/get/hosts')
  async getAllHost(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let host: Host[] = await this.hostService.findAll(
        {},
        {
          id: true,
          created_at: true,
          first_name: true,
          last_name: true,
          is_approved: true,
        },
        {},
      );
      let all_hosts = [];
      for (let i = 0; i < host.length; i++) {
        let obj = {};
        obj['id'] = host[i].id;
        obj['joined_date'] = HelperService.getJoinedDate(host[i].created_at);
        obj['name'] = `${host[i].first_name} ${host[i].last_name}`;
        obj['status'] = host[i].is_approved;
        all_hosts.push(obj);
      }
      return res.status(200).json({
        success: true,
        data: all_hosts,
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

  @Get('auth/host/details/:id')
  async getHost(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      let obj = {};
      let host = await this.hostService.findOne(
        { id: id },
        {
          phone_number: true,
          first_name: true,
          last_name: true,
          email: true,
          id: true,
          is_phone_verified: true,
          is_email_verified: true,
          is_approved: true,
          liscense_photo: true,
          id_card_photo: true,
          profile_photo: true,
          insurance_card_photo: true,
          registration_card_photo: true,
        },
        {},
      );
      let liscense_photo_url = '';
      let id_card_photo_url = '';
      let profile_photo_url = '';
      let insurance_card_photo_url = '';
      let registration_card_photo_url = '';

      if (host.liscense_photo != null) {
        liscense_photo_url = await this.s3Service.getSignedUrlForDriver(
          host.liscense_photo,
        );
      }
      if (host.id_card_photo != null) {
        id_card_photo_url = await this.s3Service.getSignedUrlForDriver(
          host.id_card_photo,
        );
      }
      if (host.profile_photo != null) {
        profile_photo_url = await this.s3Service.getSignedUrlForDriver(
          host.profile_photo,
        );
      }
      if (host.insurance_card_photo != null) {
        insurance_card_photo_url = await this.s3Service.getSignedUrlForDriver(
          host.insurance_card_photo,
        );
      }
      if (host.registration_card_photo != null) {
        registration_card_photo_url =
          await this.s3Service.getSignedUrlForDriver(
            host.registration_card_photo,
          );
      }
      obj['is_phone_verified'] = host.is_phone_verified;
      obj['is_email_verified'] = host.is_email_verified;
      obj['status'] = host.is_approved;
      obj['id'] = host.id;
      obj['registration_card_photo'] = registration_card_photo_url;
      obj['insurance_card_photo'] = insurance_card_photo_url;
      obj['id_card_photo'] = id_card_photo_url;
      obj['profile_photo'] = profile_photo_url;
      obj['liscense_photo'] = liscense_photo_url;
      obj['email'] = host.email;
      obj['name'] = host.first_name + ' ' + host.last_name;
      obj['phone'] = host.phone_number;

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

  @Patch('auth/host/status/:id')
  async updateHostStatus(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      let host = await this.hostService.findOne({ id: id });
      console.log(payload);
      if (payload.status == true) {
        host.is_approved = true;
        let updateHost = await this.hostService.UpdateHost(id, {
          is_approved: true,
        });
        return res.status(200).json({
          success: false,
          data: [{ status: true }],
          message: ['Host status updated successfully'],
        });
      }
      host.is_approved = false;
      let updateHost = await this.hostService.UpdateHost(id, {
        is_approved: false,
      });
      return res.status(200).json({
        success: false,
        data: [{ status: false }],
        message: ['host status updated successfully'],
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
