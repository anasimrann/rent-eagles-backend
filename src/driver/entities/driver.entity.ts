import { BookingEntity } from 'src/booking/entities/booking.entity';
import { CarReviewEntity } from 'src/car_reviews/entities/car_review.entity';
import { Review } from 'src/driver_reviews/entities/review.entity';
import { hostReview } from 'src/host_reviews/entity/host_review.entity';
import { TripsCompleted } from 'src/trips_completed/entities/trips_completed.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('driver')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: true, type: 'varchar' })
  city: string;

  @Column({ nullable: true, type: 'varchar' })
  state: string;

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

  @Column({ default: false })
  is_driver_expert: boolean;

  @Column({ default: false })
  is_approved_to_drive: boolean;

  @Column({ nullable: true, type: 'varchar', length: 500 }) // Change 500 to your desired length
  liscense_photo: string;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  id_card_photo: string;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  profile_photo: string;

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

  @OneToMany((type) => CarReviewEntity, (carReview) => carReview.driver)
  carReviews: CarReviewEntity[];

  // @ManyToMany((type) => CarReviewEntity, (car) => car.drivers)
  // car: CarReviewEntity[];

  @OneToMany(() => Review, (driver) => driver.driver)
  reviews: Review[];

  //one driver can complete many trips
  @OneToMany(() => TripsCompleted, (trips_completed) => trips_completed.driver)
  trips_completed: TripsCompleted[];

  //one driver can have many bookings
  @OneToMany(() => BookingEntity, (booking) => booking.driver)
  driverBookings: BookingEntity[];

  //one driver can give many reviews to host
  @OneToMany(() => hostReview, (host_review) => host_review.driver)
  hostReviews: hostReview;
}
