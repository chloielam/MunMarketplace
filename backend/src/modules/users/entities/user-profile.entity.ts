import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ManyToOne, JoinColumn } from 'typeorm';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid') profile_id: string;

  @Column('uuid') user_id: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'user_id' }) user: User;

  @Column({ type: 'text', nullable: true }) bio?: string;
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: string; // e.g. "4.50"
  @Column({ type: 'int', default: 0 }) total_ratings: number;
  @Column({ length: 255, nullable: true }) location?: string;
  @Column({ length: 255, nullable: true }) study_program?: string;
  @Column({ length: 255, nullable: true }) department?: string;
  @UpdateDateColumn() updated_at: Date;
}
