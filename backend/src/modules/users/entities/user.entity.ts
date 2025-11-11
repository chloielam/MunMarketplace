import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') user_id: string;

  @Column({ unique: true }) mun_email: string;
  @Column({ nullable: true }) password_hash?: string;             // nullable for OTP flow
  @Column() first_name: string;
  @Column({ nullable: true }) last_name?: string;
  @Column({ nullable: true }) phone_number?: string;
  @Column({ nullable: true }) profile_picture_url?: string;
  @Column({ default: false }) is_email_verified: boolean;

  @CreateDateColumn() created_at: Date;
  @Column({ type: 'datetime', nullable: true }) last_login?: Date;
  @Column({ default: true }) is_active: boolean;
}