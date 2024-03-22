import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { AdminService } from '../admin.service';

@Injectable()
export class adminMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
  ) {}

  async use(req: Request, res: Response, next: () => void) {
    try {
      if (!req.headers['authorization']) {
        return res.status(401).json({
          success: false,
          message: ['Please login to continue'],
          data: [],
        });
      }
      const accessToken = req.headers['authorization'].replace('Bearer ', '');
      const decodedAccessToken =
        await this.authService.verifyAccessToken(accessToken);
      if (!decodedAccessToken) {
        return res.status(401).json({
          success: false,
          data: [],
          message: ['Please Login into continue'],
        });
      }
      let findadmin = await this.adminService.findOne({
        id: decodedAccessToken.id,
      });

      if (!findadmin) {
        return res.status(401).json({
          success: false,
          data: [],
          message: ['Please Login into continue'],
        });
      }

      let admin = { ...findadmin };
      // delete admin.password;
      Object.assign(req, {
        admin,
      });
      next();
    } catch (e) {
      if (
        e.message === 'invalid signature' ||
        e.message === 'jwt malformed' ||
        e.message === 'jwt expired'
      ) {
        return res.status(401).json({
          success: false,
          message: 'Please login to continue',
          data: [],
        });
      } else
        return res.status(500).json({
          success: false,
          message: [],
          data: [],
        });
    }
  }
}
