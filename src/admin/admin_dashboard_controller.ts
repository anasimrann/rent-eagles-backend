import { Controller, Req, Res, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { CarService } from 'src/car/car.service';
import { DriverService } from 'src/driver/driver.service';
import { HostService } from 'src/host/host.service';

@Controller('admin')
export class adminDashBoardController {
  constructor(
    private readonly carService: CarService,
    private readonly driverService: DriverService,
    private readonly hostService: HostService,
  ) {}

  @Get('auth/get/dashboard')
  async getTotal(@Req() req: Request, @Res() res: Response) {
    try {
      let cars = await this.carService.findCarsCount();
      let hosts = await this.hostService.findHostCount();
      let drivers = await this.driverService.findDriverCount();

      let host_query = `
       SELECT
        DATE_FORMAT(created_at, '%M %Y') AS month,
        COUNT(*) AS host_count
        FROM
        host
        GROUP BY
        DATE_FORMAT(created_at, '%M %Y')
        ORDER BY
        MAX(created_at);
        `;

      let driver_query = `
        SELECT 
        DATE_FORMAT(created_at, '%M %Y') AS month,
        COUNT(*) AS driver_count
        FROM
        driver
        GROUP BY
        DATE_FORMAT(created_at,'%M %Y')
        ORDER BY
        MAX(created_at);
        `;

      let host_month_wise = await this.hostService.month_wise_host(host_query);
      let driver_month_wise =
        await this.driverService.executeQuery(driver_query);
      return res.status(200).json({
        success: false,
        data: [
          {
            cars: cars,
            hosts: hosts,
            drivers: drivers,
            total_users: hosts + drivers,
            host_month_wise,
            driver_month_wise,
          },
        ],
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
}
