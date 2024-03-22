import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { ClientType } from '../email_verification.enum';

@Entity('email_verification')
export class EmailVerification {
  @PrimaryGeneratedColumn('increment')
  @Column({
    primary: true,
    type: 'bigint',
  })
  id: number;

  @Column({ type: 'bigint', nullable: false })
  client_id: number;

  @Column({ type: 'enum', enum: ClientType, nullable: false })
  client_type: ClientType;

  @Column({nullable:false})
  token: string;

  @Column({nullable:false,default:0})
  max_attempts:number;

  @Column({type:'boolean', nullable:false, default:false})
  is_used:Boolean;

  @Column({type:'boolean', nullable:false, default:false})
  is_expired:Boolean

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
}
