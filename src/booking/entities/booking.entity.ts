import { CarDetails } from 'src/car/entities/car.entity';
import { Driver } from 'src/driver/entities/driver.entity';
import { Host } from 'src/host/entities/host.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum statusType {
  COMPLETED = 'completed',
  REQUEST_PROCESSING = 'request processing',
  REJECTED = 'rejected',
  YET_TO_DELIVER = 'yet to deliver',
  PROGRESS = 'In Progress',
}

@Entity('booking')
export class BookingEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: false, type: 'timestamp' })
  start_date: Date;

  @Column({ nullable: false, type: 'timestamp' })
  end_date: Date;

  @Column({
    nullable: false,
    type: 'enum',
    enum: statusType,
    default: statusType.REQUEST_PROCESSING,
  })
  status: statusType;

  @Column({ nullable: false, type: 'bigint' })
  per_day_price: number;

  @Column({ nullable: false, type: 'time' })
  start_time: string;
  @Column({ nullable: false, type: 'time' })
  end_time: string;

  @Column({ nullable: false, type: 'varchar' })
  address: string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  /**************************RELATIONS****************************/

  @ManyToOne(() => Driver, (driver) => driver.driverBookings)
  driver: Driver;

  @ManyToOne(() => CarDetails, (car) => car.Booking)
  car: CarDetails;

  @ManyToOne(() => Host, (host) => host.booking)
  host: Host;
}
