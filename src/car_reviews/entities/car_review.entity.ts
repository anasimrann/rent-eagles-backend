import { CarDetails } from 'src/car/entities/car.entity';
import { Driver } from 'src/driver/entities/driver.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('car_review')
export class CarReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  rating: number;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'int', nullable: false })
  cleanliness: number;

  @Column({ type: 'int', nullable: false })
  maintenance: number;

  @Column({ type: 'int', nullable: false })
  communication: number;

  @Column({ type: 'int', nullable: false })
  convenience: number;

  @Column({ type: 'int', nullable: false })
  accuracy: number;

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

  /***********************************RELATIONS***********************************/

  @ManyToOne(type => Driver, driver => driver.carReviews)
  driver: Driver;
  // @ManyToMany((type) => Driver, (driver) => driver.car)
  // @JoinTable({ name: 'car_driver_review' })
  // drivers: Driver[];

  @ManyToOne(() => CarDetails, (car_details) => car_details.car_reviews)
  car: CarDetails;
}
