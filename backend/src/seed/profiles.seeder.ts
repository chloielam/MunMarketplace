// src/seed/profiles.seeder.ts
import { DataSource } from 'typeorm';
import { UserProfile } from '../modules/users/entities/user-profile.entity';
import { User } from '../modules/users/entities/user.entity';

export async function runProfilesSeeder(ds: DataSource, users: User[]) {
  const profileRepo = ds.getRepository(UserProfile);
  if ((await profileRepo.count()) > 0) return profileRepo.find();

  const map = new Map(users.map((u) => [u.mun_email, u]));
  const profiles = profileRepo.create([
    {
      user_id: map.get('gia.lam@mun.ca')!.user_id,
      bio: 'MSc CS at MUN',
      rating: '4.85',
      total_ratings: 10,
      location: 'St. John’s',
      study_program: 'MSc CS',
      department: 'CS',
    },
    {
      user_id: map.get('rumnaz@mun.ca')!.user_id,
      bio: 'SE student',
      rating: '4.60',
      total_ratings: 7,
      location: 'St. John’s',
      study_program: 'BSc SE',
      department: 'Engineering',
    },
    {
      user_id: map.get('kriti@mun.ca')!.user_id,
      bio: 'UI enthusiast',
      rating: '4.20',
      total_ratings: 5,
      location: 'St. John’s',
      study_program: 'BSc CS',
      department: 'Science',
    },
  ]);
  return profileRepo.save(profiles);
}
