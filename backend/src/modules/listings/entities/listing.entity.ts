import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { ManyToOne, JoinColumn } from 'typeorm';
export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SOLD = 'SOLD',
  HIDDEN = 'HIDDEN',
}

@Entity('listings') // table name
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 140 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ default: 'CAD' })
  currency: string;

  @Index()
  @Column({ length: 64 })
  category: string;

  @Index()
  @Column({ length: 64 })
  city: string;

  @Index()
  @Column({ length: 64 })
  campus: string;

  @Column('simple-array', { nullable: true })
  imageUrls?: string[];

  @Index()
  @Column()
  seller_id: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'seller_id' }) seller: User;

  @Index()
  @Column({ name: 'sold_to_user_id', nullable: true })
  sold_to_user_id?: string;
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sold_to_user_id' })
  soldToUser?: User;

  @Column({ type: 'datetime', nullable: true })
  soldAt?: Date;

  @Index()
  @Column({
    type: 'simple-enum',
    enum: ListingStatus,
    default: ListingStatus.ACTIVE,
  })
  status: ListingStatus;

  // timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
