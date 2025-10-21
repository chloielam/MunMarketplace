import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { runUsersSeeder } from './users.seeder';
import { runProfilesSeeder } from './profiles.seeder';
import { runListingsSeeder } from './listings.seeder';
import { runChatSeeder } from './chat.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  // 1️⃣ Seed Users
  const users = await runUsersSeeder(ds);

  // 2️⃣ Seed Profiles (needs users)
  await runProfilesSeeder(ds, users);

  // 3️⃣ Seed Listings (needs users)
  const listings = await runListingsSeeder(ds, users);

  // 4️⃣ Seed Chat Messages (needs users and listings)
  await runChatSeeder(ds, users, listings);

  await app.close();
  console.log('🎉 All seeding complete');
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
