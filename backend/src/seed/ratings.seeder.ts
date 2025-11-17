import { DataSource } from 'typeorm';
import { SellerRating } from '../modules/ratings/entities/seller-rating.entity';
import { User } from '../modules/users/entities/user.entity';
import { Listing } from '../modules/listings/entities/listing.entity';

export async function runRatingsSeeder(ds: DataSource, users: User[], listings: Listing[]) {
  const ratingRepo = ds.getRepository(SellerRating);

  const userMap = new Map(users.map(u => [u.mun_email, u]));
  const seller = userMap.get('gia.lam@mun.ca');
  const buyerOne = userMap.get('rumnaz@mun.ca');
  const buyerTwo = userMap.get('kriti@mun.ca');

  if (!seller || !buyerOne || !buyerTwo) {
    throw new Error('Seeding ratings requires Gia, Rumnaz, and Kriti test users.');
  }

  const officeChairListing = listings.find(l => l.title === 'Office Chair — ergonomic');
  const monitorListing = listings.find(l => l.title === '27" Dual Monitor Bundle');

  if (!officeChairListing || officeChairListing.sold_to_user_id !== buyerOne.user_id) {
    throw new Error('Office Chair listing must be sold to Rumnaz before rating seed can run.');
  }

  if (!monitorListing || monitorListing.sold_to_user_id !== buyerTwo.user_id) {
    throw new Error('Monitor bundle listing must be sold to Kriti before rating seed can run.');
  }

  const ratingDefinitions = [
    {
      seller_id: seller.user_id,
      buyer_id: buyerOne.user_id,
      listing_id: officeChairListing.id,
      rating: 5,
      review: 'Smooth transaction and the condition was exactly as described.',
    },
    {
      seller_id: seller.user_id,
      buyer_id: buyerTwo.user_id,
      listing_id: monitorListing.id,
      rating: 4,
      review: 'Great deal overall. Packaging could have been better but still happy!',
    },
  ];

  for (const data of ratingDefinitions) {
    let rating = await ratingRepo.findOne({
      where: {
        listing_id: data.listing_id,
        buyer_id: data.buyer_id,
      },
    });

    if (rating) {
      Object.assign(rating, data);
    } else {
      rating = ratingRepo.create(data);
    }

    await ratingRepo.save(rating);
  }

  return ratingRepo.find({
    where: { seller_id: seller.user_id },
  });
}
