import { Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { DriverService } from '../driver.service';

@Injectable()
export class DriverAuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly driverService: DriverService,
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
      let finduser = await this.driverService.findOne({
        id: decodedAccessToken.id,
      });

      if (!finduser) {
        return res.status(401).json({
          success: false,
          data: [],
          message: ['Please Login into continue'],
        });
      }

      let user = { ...finduser };
      delete user.password;
      Object.assign(req, {
        user,
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
