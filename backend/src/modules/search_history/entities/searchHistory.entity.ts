// src/modules/search-history/entity/search-history.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('search_history')
export class SearchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  search_query: string;

  @Column({ nullable: true })
  category: string; 


  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  min_price?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  max_price?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @CreateDateColumn()
  searched_at: Date;
}
