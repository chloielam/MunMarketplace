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
      imageUrls: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'],
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
      imageUrls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
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
      imageUrls: ['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80'],
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
      imageUrls: ['https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80'],
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
      imageUrls: ['https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80'],
      seller_id: seller.user_id,
      status: ListingStatus.SOLD,
      sold_to_user_id: buyerTwo.user_id,
      soldAt: now,
    },
    {
      title: 'KitchenAid Stand Mixer (Aqua Sky)',
      description: 'Works perfectly and comes with dough hook + whisk.',
      price: '180.00',
      currency: 'CAD',
      category: 'Appliances',
      city: "St. John’s",
      campus: 'MUN-StJohns',
      imageUrls: ['https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80'],
      seller_id: seller.user_id,
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'Nintendo Switch OLED bundle',
      description: 'Includes carrying case and Zelda: Tears of the Kingdom.',
      price: '420.00',
      currency: 'CAD',
      category: 'Gaming',
      city: "St. John’s",
      campus: 'MUN-StJohns',
      imageUrls: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80'],
      seller_id: seller.user_id,
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'Samsung 55" 4K Smart TV',
      description: 'Crystal UHD panel, includes remote + wall mount.',
      price: '500.00',
      currency: 'CAD',
      category: 'Electronics',
      city: "St. John’s",
      campus: 'MUN-StJohns',
      imageUrls: ['https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80'],
      seller_id: seller.user_id,
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'Canon EOS M50 mirrorless camera',
      description: 'Comes with 15-45mm lens, perfect for vlogging.',
      price: '650.00',
      currency: 'CAD',
      category: 'Electronics',
      city: "St. John’s",
      campus: 'MUN-StJohns',
      imageUrls: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80'],
      seller_id: seller.user_id,
      status: ListingStatus.ACTIVE,
    },
    {
      title: 'Dyson V11 cordless vacuum',
      description: 'Hold charge for 1 hour, includes charging wall dock.',
      price: '380.00',
      currency: 'CAD',
      category: 'Appliances',
      city: "St. John’s",
      campus: 'MUN-StJohns',
      imageUrls: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'],
      seller_id: seller.user_id,
      status: ListingStatus.ACTIVE,
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
