import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from './entities/admin.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async Save(admin: AdminEntity) {
    return await this.adminRepository.save(admin);
  }
  async findOne(
    query: FindOptionsWhere<AdminEntity> | FindOptionsWhere<AdminEntity>[],
    select = [],
    relations = {},
  ) {
    return await this.adminRepository.findOne({
      where: query,
      select,
      relations,
    });
  }
}
