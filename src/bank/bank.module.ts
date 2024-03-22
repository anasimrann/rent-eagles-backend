import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { BankService } from './bank.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankDetailEntity } from './entities/bank_details.entity';

@Module({
  imports:[TypeOrmModule.forFeature([BankDetailEntity])],
  controllers: [BankController],
  providers: [BankService]
})
export class BankModule {}
