import { BankDetailEntity } from 'src/bank/entities/bank_details.entity';
import { BookingEntity } from 'src/booking/entities/booking.entity';
import { CarDetails } from 'src/car/entities/car.entity';
import { Review } from 'src/driver_reviews/entities/review.entity';
import { hostReview } from 'src/host_reviews/entity/host_review.entity';
import { TripsCompleted } from 'src/trips_completed/entities/trips_completed.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';

@Entity('host')
export class Host {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ default: false })
  is_mob_notifications: boolean;

  @Column({ default: false })
  is_email_notifications: boolean;

  @Column({ default: false })
  is_phone_verified: boolean;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ nullable: true, type: 'varchar' })
  city: string;

  @Column({ nullable: true, type: 'varchar' })
  state: string;

  @Column({ default: false })
  is_host_expert: boolean;

  @Column({ default: false })
  is_approved: boolean;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  liscense_photo: string;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  id_card_photo: string;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  profile_photo: string;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  insurance_card_photo: string;
  @Column({ nullable: true, type: 'varchar', length: 500 })
  registration_card_photo: string;

  @Column({ nullable: false, default: false })
  is_documents_verified: boolean;

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

  /*********************RELATIONS******************/
  @OneToOne(() => BankDetailEntity, (host) => host.host)
  bank: BankDetailEntity;

  @OneToMany(() => Review, (driver) => driver.driver)
  reviews: Review[];

  //one host can have multiple cars
  @OneToMany(() => CarDetails, (car_details) => car_details.host)
  cars: CarDetails[];

  //one host car can have multiple trips completed
  @OneToMany(() => TripsCompleted, (trips_completed) => trips_completed.host)
  trips_completed: TripsCompleted[];

  @OneToMany(() => BookingEntity, (booking) => booking.host)
  booking: BookingEntity[];

  //one host can have many reviews;
  @OneToMany(() => hostReview, (host_review) => host_review.host)
  reviews_host: hostReview[];
}
