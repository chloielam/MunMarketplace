// src/seed/chat.seeder.ts
import { DataSource } from 'typeorm';
import { Message } from '../modules/chat/entities/chat-message';
import { User } from '../modules/users/entities/user.entity';
import { Listing } from '../modules/listings/entities/listing.entity';

export async function runChatSeeder(ds: DataSource, users: User[], listings: Listing[]) {
  const messageRepo = ds.getRepository(Message);

  // Skip if messages already exist
  if ((await messageRepo.count()) > 0) return;

  const userMap = new Map(users.map(u => [u.mun_email, u]));
  const listingMap = new Map(listings.map(l => [l.title, l]));

  const messages = [
    {
      sender: userMap.get('gia.lam@mun.ca')!,
      receiver: userMap.get('rumnaz@mun.ca')!,
      listing: listingMap.get('IKEA Desk – good condition')!,
      content: 'Is this desk still available?',
    },
    {
      sender: userMap.get('rumnaz@mun.ca')!,
      receiver: userMap.get('gia.lam@mun.ca')!,
      listing: listingMap.get('IKEA Desk – good condition')!,
      content: 'Yes, it is available.',
    },
    {
      sender: userMap.get('kriti@mun.ca')!,
      receiver: userMap.get('rumnaz@mun.ca')!,
      listing: listingMap.get('Algorithms Textbook (4th Ed.)')!,
      content: 'Hi, I want to buy the textbook.',
    },
  ];

  for (const m of messages) {
    await messageRepo.save(messageRepo.create(m));
  }

  console.log('✅ Messages seeded');
}
