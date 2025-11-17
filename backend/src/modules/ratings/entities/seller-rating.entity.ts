import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';

@Entity('seller_ratings')
@Index(['listing_id', 'buyer_id'], { unique: true })
export class SellerRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'seller_id' })
  seller_id: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column('uuid', { name: 'buyer_id' })
  buyer_id: string;
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column('uuid', { name: 'listing_id' })
  listing_id: string;
  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  review?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
