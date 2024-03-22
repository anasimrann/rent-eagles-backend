import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankDetailEntity } from './entities/bank_details.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(BankDetailEntity)
    private bankRepository: Repository<BankDetailEntity>,
  ) {}
  async save(fields: BankDetailEntity) {
    return await this.bankRepository.save(fields);
  }

  async updateBank(id:number,data:Partial<BankDetailEntity>)
  {
    return await this.bankRepository.update({id:id},data)
  }

  async findOne(
    query: FindOptionsWhere<BankDetailEntity> | FindOptionsWhere<BankDetailEntity>[],
    select = [],
    relations = {},
  ) {
    return await this.bankRepository.findOne({
      where: query,
      select,
      relations,
    });
  }

  async findExistHostBank(hostId: number) {
    return await this.bankRepository.findOne({
      select: {},
      relations: { host: true },
      where: {
        host: {
          id: hostId,
        },
      },
    });
  }
}
