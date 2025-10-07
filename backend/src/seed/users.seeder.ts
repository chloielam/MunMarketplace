// src/seed/users.seeder.ts
import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import bcrypt from 'bcryptjs';

export async function runUsersSeeder(ds: DataSource) {
  const userRepo = ds.getRepository(User);

  // idempotent: skip if users exist
  if (await userRepo.count() > 0) return userRepo.find();

  const pwd = await bcrypt.hash('password123', 10);
  const users = userRepo.create([
    { mun_email: 'gia.lam@mun.ca', password_hash: pwd, first_name: 'Gia Truc', last_name: 'Lam', is_email_verified: true },
    { mun_email: 'rumnaz@mun.ca',   password_hash: pwd, first_name: 'Rumnaz',  last_name: 'Ahmed', is_email_verified: true },
    { mun_email: 'kriti@mun.ca',    password_hash: pwd, first_name: 'Kriti',   last_name: 'Patel', is_email_verified: false },
  ]);
  return userRepo.save(users);
}