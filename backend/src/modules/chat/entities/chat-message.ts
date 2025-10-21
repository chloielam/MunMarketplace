import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User, { eager: true })
@JoinColumn({ name: 'sender_id' })
sender: User;

@ManyToOne(() => User, { eager: true })
@JoinColumn({ name: 'receiver_id' })
receiver: User;

@ManyToOne(() => Listing, { nullable: true, eager: true })
@JoinColumn({ name: 'listing_id' })
listing?: Listing;


  @CreateDateColumn()
  created_at: Date;
}
