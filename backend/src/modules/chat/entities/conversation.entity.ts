import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('simple-array')
  participantIds: string[]; // ['user1', 'user2'] - just IDs for now

  @Column({ nullable: true })
  listingId: string; // Which product they're talking about (optional)

  @UpdateDateColumn()
  lastMessageAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}