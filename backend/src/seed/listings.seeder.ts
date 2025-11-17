// src/seed/listings.seeder.ts
import { DataSource } from 'typeorm';
import { Listing, ListingStatus } from '../modules/listings/entities/listing.entity';
import { User } from '../modules/users/entities/user.entity';

export async function runListingsSeeder(ds: DataSource, users: User[]) {
  const listingRepo = ds.getRepository(Listing);

  const userMap = new Map(users.map(u => [u.mun_email, u]));
  const seller = userMap.get('gia.lam@mun.ca') || users[0];
  const buyerOne = userMap.get('rumnaz@mun.ca');
  const buyerTwo = userMap.get('kriti@mun.ca');

  if (!seller || !buyerOne || !buyerTwo) {
    throw new Error('Seeding listings requires seed users for Gia, Rumnaz, and Kriti.');
  }

  const now = new Date();

  const listingsData = [
    {
      title: 'IKEA Desk – good condition',
      description: 'Spacious desk, pickup near MUN residence.',
      price: '60.00',
      currency: 'CAD',
      category: 'Furniture',
      city: "St. John’s",
      campus: 'MUN-StJohns',
      imageUrls: ['https://picsum.photos/seed/desk/400/300'],
      seller_id: seller.user_id,
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'MacBook Pro 2020',
      description: '13-inch, 256GB SSD, excellent battery life.',
      price: '950.00',
      currency: 'CAD',
      category: 'Electronics',
      city: "St. John’s",
      campus: 'MUN-StJohns',
      imageUrls: ['https://picsum.photos/seed/mac/400/300'],
      seller_id: seller.user_id,
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'Algorithms Textbook (4th Ed.)',
      description: 'Used lightly for one semester.',
      price: '40.00',
      currency: 'CAD',
      category: 'Textbooks',
      city: "St. John's",
      campus: 'MUN-StJohns',
      imageUrls: ['https://picsum.photos/seed/book/400/300'],
      seller_id: seller.user_id,
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'Office Chair — ergonomic',
      description: 'Mesh back, almost new.',
      price: '120.00',
      currency: 'CAD',
      category: 'Furniture',
      city: "St. John’s",
      campus: 'MUN-StJohns',
      imageUrls: ['https://picsum.photos/seed/chair/400/300'],
      seller_id: seller.user_id,
      status: ListingStatus.SOLD,
      sold_to_user_id: buyerOne.user_id,
      soldAt: now,
    },
    {
      title: '27" Dual Monitor Bundle',
      description: 'Two matching 27" displays with HDMI cables.',
      price: '275.00',
      currency: 'CAD',
      category: 'Electronics',
      city: "St. John’s",
      campus: 'MUN-StJohns',
      imageUrls: ['https://picsum.photos/seed/monitor/400/300'],
      seller_id: seller.user_id,
      status: ListingStatus.SOLD,
      sold_to_user_id: buyerTwo.user_id,
      soldAt: now,
    },
  ];

  for (const data of listingsData) {
    let listing = await listingRepo.findOne({
      where: { seller_id: data.seller_id, title: data.title },
      withDeleted: true,
    });

    if (listing) {
      Object.assign(listing, data);
    } else {
      listing = listingRepo.create(data);
    }

    await listingRepo.save(listing);
  }

  return listingRepo.find();
}
