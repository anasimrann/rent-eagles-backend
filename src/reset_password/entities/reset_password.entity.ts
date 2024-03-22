import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ClientTypeRESETPASS {
  DRIVER = 'driver',
  HOST = 'host',
}
@Entity()
export class ResetPassword {
  @PrimaryGeneratedColumn('increment')
  @Column({
    primary: true,
    type: 'bigint',
  })
  public id: number;

  @Column({ nullable: false })
  token: string;

  @Column({ nullable: false })
  max_attempts: number;

  @Column({ nullable: false })
  unique_id: string;

  @Column({ nullable: false })
  email: string;

  @Column({ default: false })
  is_used: boolean;

  @Column({ default: false })
  is_expired: boolean;

  @Column({ type: 'enum', enum: ClientTypeRESETPASS, nullable: false })
  client_type: ClientTypeRESETPASS;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updated_at:Date

  @CreateDateColumn({
    type: 'timestamp',
  })
  created_at:Date
}
