import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin')
export class AdminEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;
}
