// src/modules/orders/entity/order.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('orders')
@Index('idx_orders_status', ['order_status'])
@Index('idx_orders_buyer', ['buyer'])
@Index('idx_orders_seller', ['seller'])
@Index('idx_orders_delivery', ['delivery_option'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column({ type: 'enum', enum: ['pending','confirmed','completed','cancelled'], default: 'pending' })
  order_status: string;

  @Column({ type: 'enum', enum: ['PICKUP','DELIVERY'] })
  delivery_option: string;

  @Column({ nullable: true })
  pickup_location?: string;

  @Column({ nullable: true })
  delivery_location?: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_pickup_time?: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_delivery_time?: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_pickup_time?: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_delivery_time?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
