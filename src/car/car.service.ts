import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarDetails } from './entities/car.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(CarDetails)
    private carDetailRepository: Repository<CarDetails>,
    private dataSource: DataSource,
  ) {}

  async findCarsCount() {
    return await this.carDetailRepository.count();
  }

  async Update(car: Partial<CarDetails>) {
    return await this.carDetailRepository.save(car);
  }

  async findOne(
    query: FindOptionsWhere<CarDetails> | FindOptionsWhere<CarDetails>[],
    select = [],
    relations = {},
  ) {
    return await this.carDetailRepository.findOne({
      where: query,
      select,
      relations,
    });
  }
  async save(fields: CarDetails) {
    return await this.carDetailRepository.save(fields);
  }

  async delete(id: number) {
    await this.carDetailRepository.delete({ id: id });
  }

  async executeQuery(query: string) {
    return await this.dataSource.query(query);
  }

  async findHostWithCarId(id: number) {
    return await this.carDetailRepository.findOne({
      relations: {
        host: true,
      },
      select: {},
      where: {
        id: id,
      },
    });
  }

  async findMany(
    query: FindOptionsWhere<CarDetails> | FindOptionsWhere<CarDetails>[],
    select = {},
    relations = {},
  ) {
    return await this.carDetailRepository.find({
      where: query,
      select,
      relations,
    });
  }

  //service for admin, pagination will also be implemented, cars will be displayed on admin dashboard
  async carsForAdminDashboard(
    query: FindOptionsWhere<CarDetails> | FindOptionsWhere<CarDetails>[],
    select = {},
    relations = {},
    skip,
    take
  ) {
    return await this.carDetailRepository.find({
      where:query,
      select,
      relations,
      skip,
      take
    });
  }
}
