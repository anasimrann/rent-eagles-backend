import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Host } from './entities/host.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class HostService {
  constructor(
    @InjectRepository(Host)
    private hostRepository: Repository<Host>,
    private dataSource: DataSource,
  ) {}

  async month_wise_host(query: string) {
    return await this.dataSource.query(query);
  }
  
  async findHostCount() {
    return await this.hostRepository.count();
  }
  async findOne(
    query: FindOptionsWhere<Host> | FindOptionsWhere<Host>[],
    select = {},
    relations = {},
  ) {
    return await this.hostRepository.findOne({
      where: query,
      select,
      relations,
    });
  }
  async save(fields: Host) {
    return await this.hostRepository.save(fields);
  }

  async getCars(id: number) {
    return this.hostRepository.find({
      select: {
        cars: {
          id: true,
          photo_1: true,
          price_per_day: true,
          car_name: true,
          car_reviews: {
            rating: true,
          },
        },
      },
      relations: {
        cars: {
          car_reviews: true,
          trips_completed: true,
        },
      },
      where: {
        id: id,
      },
    });
  }

  async findHostDetails(id: number) {
    return await this.hostRepository.find({
      select: {
        city: true,
        state: true,
        is_email_verified: true,
        is_phone_verified: true,
        profile_photo: true,
        first_name: true,
        last_name: true,
        created_at: true,
        trips_completed: true,
        reviews_host: {
          rating: true,
        },
      },
      relations: {
        trips_completed: true,
        reviews_host: true,
      },
      where: {
        id: id,
      },
    });
  }

  async findAll(
    query: FindOptionsWhere<Host> | FindOptionsWhere<Host>[],
    select = {},
    relations = {},
  ) {
    return await this.hostRepository.find({
      where: query,
      select,
      relations,
    });
  }

  async UpdateHost(id: number, host: Partial<Host>) {
    return await this.hostRepository.update({ id: id }, host);
  }

  async executeQuery(query: string) {
    return await this.dataSource.query(query);
  }
}
