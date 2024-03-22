import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookingEntity } from 'src/booking/entities/booking.entity';
import { CarReviewEntity } from 'src/car_reviews/entities/car_review.entity';
import { Host } from 'src/host/entities/host.entity';
import { TripsCompleted } from 'src/trips_completed/entities/trips_completed.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
}

export enum GreenVehicleType {
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
}

export enum VehicleType {
  CARS = 'cars',
  SUVS = 'suvs',
  MINIVANS = 'minicars',
  TRUCKS = 'trucks',
  VANS = 'vans',
  CARGO_VANS = 'cargo vans',
}

@Entity('car_details')
export class CarDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'bigint' })
  price_per_day: number;

  @Column({ nullable: false, type: 'boolean', default: true })
  is_available: boolean;

  @Column({ nullable: true, type: 'varchar' })
  model: string;

  @Column({ nullable: true, type: 'varchar' })
  address: string;

  @Column({ nullable: true, type: 'varchar' })
  car_name: string;

  @Column({ nullable: true, type: 'varchar', unique: true })
  vin_number: string;

  @Column({ nullable: true, default: null })
  trim: string;

  @Column({ nullable: true, default: null })
  style: string;

  @Column({ nullable: true, type: 'varchar' })
  distance: string;

  @Column({ nullable: true, type: 'enum', enum: TransmissionType })
  @IsEnum(TransmissionType, { message: 'please select or manual' })
  transmission: TransmissionType;

  @Column({ nullable: true, type: 'varchar' })
  vehicle_history: string;

  @Column({ nullable: true, type: 'boolean', default: false })
  is_salvage: boolean;

  @Column({ nullable: true, type: 'varchar' })
  liscence_number: string;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  description: string;

  @Column({ nullable: true, type: 'varchar' })
  state_province: string;

  @Column({ nullable: true, type: 'simple-array' })
  car_features: string[];

  @Column({ nullable: true, type: 'varchar' })
  advance_notice: string;

  @Column({ nullable: true, type: 'varchar' })
  min_trip_duration: string;

  @Column({ nullable: true, type: 'varchar' })
  max_trip_duration: string;

  @Column({ nullable: false, type: 'boolean', default: false })
  two_day_minimum: boolean;

  @Column({ nullable: true, default: null })
  photo_1: string;

  @Column({ nullable: true, default: null })
  photo_2: string;

  @Column({ nullable: true, default: null })
  photo_3: string;

  @Column({ nullable: true, default: null })
  photo_4: string;

  @Column({ nullable: true, default: null })
  photo_5: string;

  @Column({ nullable: true, default: null })
  photo_6: string;

  @Column({ nullable: true, default: null })
  photo_7: string;

  @Column({ nullable: true, default: null })
  photo_8: string;

  @Column({ nullable: true, default: null })
  photo_9: string;

  @Column({ nullable: true, default: null })
  photo_10: string;

  @Column({
    nullable: true,
    default: GreenVehicleType.ELECTRIC,
    type: 'enum',
    enum: GreenVehicleType,
  })
  green_vehicle: GreenVehicleType;

  @Column({ nullable: true, type: 'enum', enum: VehicleType })
  vehicle_type: VehicleType;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  number_of_seats: number;

  @Column({ default: false})
  is_approved: boolean;

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

  /************************RELATIONS***********************************/
  @OneToMany(
    () => CarReviewEntity,
    (car_review_entity) => car_review_entity.car,
  )
  car_reviews: CarReviewEntity[];

  //one car can belong to one host
  @ManyToOne(() => Host, (host) => host.cars)
  host: Host;

  //one car can complete many trips
  @OneToMany(() => TripsCompleted, (trips_completed) => trips_completed.car)
  trips_completed: TripsCompleted[];

  //one car can have many bookings
  @OneToMany(() => BookingEntity, (booking) => booking.car)
  Booking: BookingEntity[];
}
