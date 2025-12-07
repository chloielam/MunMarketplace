import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-array')
  participantIds: string[]; // ['user1', 'user2'] - just IDs for now

  @Column({ nullable: true })
  listingId: string; // Which product they're talking about (optional)

  @Column({ type: 'text', nullable: true })
  lastMessage: string; // New column to store the message content for easy lookup

  @UpdateDateColumn()
  lastMessageAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
