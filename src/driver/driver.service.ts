import { Injectable } from '@nestjs/common';
import { Driver } from './entities/driver.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource } from 'typeorm';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private dataSource: DataSource,
  ) {}

  async executeQuery(query: string) {
    return await this.dataSource.query(query);
  }

  async findDriverCount() {
    return await this.driverRepository.count();
  }

  async findOne(
    query: FindOptionsWhere<Driver> | FindOptionsWhere<Driver>[],
    select = {},
    relations = {},
  ) {
    return await this.driverRepository.findOne({
      where: query,
      select,
      relations,
    });
  }
  async save(fields: Driver) {
    return await this.driverRepository.save(fields);
  }

  async findMany(
    query: FindOptionsWhere<Driver> | FindOptionsWhere<Driver>[],
    select = {},
    relations = {},
  ) {
    return await this.driverRepository.find({
      where: query,
      select,
      relations,
    });
  }
}
