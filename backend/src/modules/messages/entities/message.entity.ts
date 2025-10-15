// src/modules/messages/entity/message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { User } from '../../users/entities/user.entity';

@Entity('messages')
@Index('idx_messages_conversation', ['conversation', 'sent_at'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column('text')
  message_text: string;

  @CreateDateColumn()
  sent_at: Date;

  @Column({ type: 'tinyint', default: 0 })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  read_at?: Date;
}
