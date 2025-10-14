// src/modules/reviews/entity/review.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('reviews')
@Index('reviewer_idx', ['reviewer'])
@Index('reviewee_idx', ['reviewee'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewee_id' })
  reviewee: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'tinyint', default: 1 })
  is_visible: boolean;
}
