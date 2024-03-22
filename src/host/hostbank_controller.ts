import {
  Controller,
  Body,
  Res,
  Post,
  Req,
  Patch,
  Put,
  Param,
  UseInterceptors,
  UploadedFiles,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BankService } from 'src/bank/bank.service';
import { BankDTO } from './dto/add_bank_dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { HostService } from './host.service';
import { BankDetailEntity } from 'src/bank/entities/bank_details.entity';

@Controller('host')
export class hostBankController {
  constructor(
    private readonly bankService: BankService,
    private readonly hostService: HostService,
  ) {}

  @Post('auth/add/bank')
  async addBankDetails(
    @Body() payload: BankDTO,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let hostId = req['HOST'].id;
      const body = plainToClass(BankDTO, payload);
      const errors = await validate(body);
      const errorMessages = errors.flatMap(({ constraints }) =>
        Object.values(constraints),
      );
      if (errors && errors.length) {
        return res.status(422).json({
          data: [],
          success: false,
          message: [errorMessages[0]],
        });
      }
      let ifBankAlreadyExists =
        await this.bankService.findExistHostBank(hostId);
      if (ifBankAlreadyExists) {
        return res.status(422).json({
          success: false,
          data: [],
          message: ['your bank already exists'],
        });
      }
      let findHost = await this.hostService.findOne({ id: hostId });
      let newBank = new BankDetailEntity();
      newBank.account_holder_name = payload.account_holder_name;
      newBank.bank_name = payload.bank_name;
      newBank.routing_no = payload.routing_no;
      newBank.account_no = payload.account_no;
      newBank.host = findHost;
      if (!(await this.bankService.save(newBank))) {
        return res.status(500).json({
          success: false,
          data: [],
          message: ['something went wrong'],
        });
      }
      return res.status(200).json({
        success: true,
        data: [],
        message: ['Your bank is added successfully'],
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: [],
        message: [err.message],
      });
    }
  }

  @Patch('auth/update/bank')
  async updateBankDetails(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      let hostId = req['HOST'].id;
      let data = {
        ...payload,
      };
      let findBank = await this.bankService.findOne(
        { host: { id: hostId } },
        [],
        {
          host: true,
        },
      );
      if (!(await this.bankService.updateBank(findBank.id, data))) {
        return res.status(500).json({
          success: false,
          data: [],
          message: ['something went wrong'],
        });
      }
      return res.status(200).json({
        success: true,
        data: [],
        message: ['Bank updated successfully'],
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
