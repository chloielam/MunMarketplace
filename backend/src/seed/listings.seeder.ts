// src/seed/listings.seeder.ts
import { DataSource } from 'typeorm';
import { Listing, ListingStatus } from '../modules/listings/entities/listing.entity';
import { User } from '../modules/users/entities/user.entity';

export async function runListingsSeeder(ds: DataSource, users: User[]) {
  const listingRepo = ds.getRepository(Listing);
  if (await listingRepo.count() > 0) return listingRepo.find();

  const u = new Map(users.map(u => [u.mun_email, u.user_id]));

  const listingsData = [
    {
      title: 'IKEA Desk – good condition',
      description: 'Spacious desk, pickup near MUN residence.',
      price: '60.00', currency: 'CAD', category: 'Furniture',
      city: "St. John’s", campus: 'MUN-StJohns',
      imageUrls: ['https://picsum.photos/seed/desk/400/300'],
      seller_id: u.get('gia.lam@mun.ca')!, status: ListingStatus.ACTIVE,
    },
    {
      title: 'MacBook Pro 2020',
      description: '13-inch, 256GB SSD, excellent battery life.',
      price: '950.00', currency: 'CAD', category: 'Electronics',
      city: "St. John’s", campus: 'MUN-StJohns',
      imageUrls: ['https://picsum.photos/seed/mac/400/300'],
      seller_id: u.get('rumnaz@mun.ca')!, status: ListingStatus.ACTIVE,
    },
    {
      title: 'Algorithms Textbook (4th Ed.)',
      description: 'Used lightly for one semester.',
      price: '40.00', currency: 'CAD', category: 'Textbooks',
      city: "St. John's", campus: 'MUN-StJohns',
      imageUrls: ['https://picsum.photos/seed/book/400/300'],
      seller_id: u.get('kriti@mun.ca')!, status: ListingStatus.ACTIVE,
    },
    {
      title: 'Office Chair — ergonomic',
      description: 'Mesh back, almost new.',
      price: '120.00', currency: 'CAD', category: 'Furniture',
      city: "St. John’s", campus: 'MUN-StJohns',
      imageUrls: ['https://picsum.photos/seed/chair/400/300'],
      seller_id: u.get('gia.lam@mun.ca')!, status: ListingStatus.SOLD,
    },
  ];
  const listings = listingsData.map(data => listingRepo.create(data));

  return listingRepo.save(listings);
}