import { Driver } from "src/driver/entities/driver.entity";
import { Host } from "src/host/entities/host.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('host_review')
export class hostReview {

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

  /***********************************RELATIONS******************************/

  @ManyToOne(()=>Host,(host)=>host.reviews_host)
  host:Host;


  @ManyToOne(()=>Driver,(driver)=>driver.hostReviews)
  driver:Driver


    

}