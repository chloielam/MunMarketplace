// src/modules/shopping-cart/entity/shopping-cart.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';

@Entity('shopping_cart')
@Unique(['user', 'listing'])
export class ShoppingCart {
  @PrimaryGeneratedColumn('uuid')
  cart_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @CreateDateColumn()
  added_at: Date;
}
