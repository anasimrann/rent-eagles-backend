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

@Entity('driver_review')
export class Review {
  Review() {}

  @PrimaryGeneratedColumn()
  @Column({
    primary: true,
    type: 'bigint',
  })
  public id: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  public description: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  public rating: number;

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
  @ManyToOne(() => Driver, (driver) => driver.reviews)
  public driver: Driver;

  @ManyToOne(() => Host, (host) => host.reviews)
  public host: Host;
}
