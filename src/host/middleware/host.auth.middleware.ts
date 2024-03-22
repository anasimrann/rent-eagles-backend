import { Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { HostService } from '../host.service';

@Injectable()
export class HostAuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly hostService: HostService,
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
          message: 'Please Login into continue',
        });
      }

      let findhost = await this.hostService.findOne({
        id: decodedAccessToken.id,
      });

      if (!findhost) {
        return res.status(401).json({
          success: false,
          data: [],
          message: 'Please Login into continue',
        });
      }

      let HOST = { ...findhost };
      delete HOST.password;
      Object.assign(req, {
        HOST,
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
          message: 'Unauthorized',
          data: [],
        });
      } else
        return res.status(500).json({
          success: false,
          message: [e.message],
          data: [],
        });
    }
  }
}
