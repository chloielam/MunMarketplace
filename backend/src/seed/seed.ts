// src/seed/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { runUsersSeeder } from './users.seeder';
import { runProfilesSeeder } from './profiles.seeder';
import { runListingsSeeder } from './listings.seeder';
import { runRatingsSeeder } from './ratings.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  // Run in FK-safe order
  const users = await runUsersSeeder(ds);
  await runProfilesSeeder(ds, users);
  const listings = await runListingsSeeder(ds, users);
  await runRatingsSeeder(ds, users, listings);

  await app.close();
  console.log('✅ Seeding complete');
}
bootstrap().catch((e) => { console.error(e); process.exit(1); });
