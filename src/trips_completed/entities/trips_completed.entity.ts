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

@Entity('trips_completed')
export class TripsCompleted {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'date' })
  start_date: Date;

  @Column({ nullable: false, type: 'date' })
  end_date: Date;

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

  /************************************RELATIONS*********************************/
  @ManyToOne(() => CarDetails, (car_details) => car_details.trips_completed)
  car: CarDetails;

  @ManyToOne(() => Host, (host) => host.trips_completed)
  host: Host;

  @ManyToOne(() => Driver, (driver) => driver.trips_completed)
  driver: Driver;
}
