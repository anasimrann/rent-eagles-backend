import { Controller, Post, Body, Req, Res, Patch } from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
  ) {}

  @Post('login')
  async adminLogin(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      console.log(payload);
      if (!payload.username || !payload.password) {
        return res.status(422).json({
          success: false,
          data: [],
          message: ['please provide valid crendenials'],
        });
      }
      let admin = await this.adminService.findOne({
        username: payload.username,
      });
      if (!admin || !(await bcrypt.compare(payload.password, admin.password))) {
        return res.status(401).json({
          success: false,
          data: [],
          message: ['please provide valid crendenials'],
        });
      }
      let accessToken = await this.authService.generateAccessToken(admin.id);

      res.header('Authorization', 'Bearer ' + accessToken);
      return res.status(200).json({
        message: ['successfully logged in'],
        data: [{ accessToken }],
        success: false,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }
  /*********************************************************************authenticated routes**************************************************/
  @Patch('auth/update/password')
  async changePassword(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let admin = req['admin'];
      if (
        !payload.old_password ||
        !payload.password ||
        !payload.confirm_password ||
        payload.password != payload.confirm_password
      ) {
        return res.status(422).json({
          success: false,
          data: [],
          message: ['enter valid passwords'],
        });
      }
      if (!(await bcrypt.compare(payload.old_password, admin.password))) {
        return res.status(401).json({
          success: false,
          data: [],
          message: ['Please enter valid old password'],
        });
      }

      let newPassword = await bcrypt.hash(payload.password, 10);

      admin.password = newPassword;

      if (!(await this.adminService.Save(admin))) {
        return res.status(500).json({
          success: false,
          data: [],
          message: ['something went wrong'],
        });
      }
      return res.status(200).json({
        success: false,
        data: [],
        message: ['Password changes successfully'],
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: [],
        message: [err.messae],
      });
    }
  }
}
