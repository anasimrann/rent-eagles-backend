import { Host } from 'src/host/entities/host.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bank_details')
export class BankDetailEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true, type: 'varchar', default: null })
  bank_name: string;

  @Column({ nullable: true, type: 'varchar' })
  account_holder_name: string;

  @Column({ nullable: true, type: 'varchar' })
  routing_no: string;

  @Column({ nullable: true, type: 'varchar' })
  account_no: string;

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

  /**********************RELATIONS****************************/
  //one host can have only one bank
  @OneToOne(() => Host, { cascade: true })
  @JoinColumn()
  host: Host;
}
