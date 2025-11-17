import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerRating } from './entities/seller-rating.entity';
import { CreateSellerRatingDto } from './dto/create-seller-rating.dto';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SellerRatingsService {
  constructor(
    @InjectRepository(SellerRating) private readonly ratingRepo: Repository<SellerRating>,
    @InjectRepository(Listing) private readonly listingRepo: Repository<Listing>,
    @InjectRepository(UserProfile) private readonly profileRepo: Repository<UserProfile>,
  ) {}

  async rateSeller(buyerId: string, sellerId: string, dto: CreateSellerRatingDto) {
    if (buyerId === sellerId) {
      throw new BadRequestException('You cannot rate yourself');
    }

    const listing = await this.listingRepo.findOne({
      where: { id: dto.listingId },
      withDeleted: true,
    });
    if (!listing) throw new NotFoundException('Listing not found');

    if (listing.seller_id !== sellerId) {
      throw new BadRequestException('Listing does not belong to this seller');
    }

    if (listing.sold_to_user_id !== buyerId) {
      throw new ForbiddenException('You were not selected as the buyer');
    }

    if (listing.status !== ListingStatus.SOLD) {
      throw new BadRequestException('Listing is not marked as sold yet');
    }

    let rating = await this.ratingRepo.findOne({
      where: { buyer_id: buyerId, listing_id: dto.listingId },
    });

    if (rating) {
      rating.rating = dto.rating;
      rating.review = dto.review;
    } else {
      rating = this.ratingRepo.create({
        buyer_id: buyerId,
        seller_id: sellerId,
        listing_id: dto.listingId,
        rating: dto.rating,
        review: dto.review,
      });
    }

    const saved = await this.ratingRepo.save(rating);
    await this.refreshSellerAggregate(sellerId);

    const withRelations = await this.ratingRepo.findOne({
      where: { id: saved.id },
      relations: ['buyer', 'listing'],
    });
    return this.serializeRating(withRelations ?? saved);
  }

  async getSellerRatings(sellerId: string) {
    const ratings = await this.ratingRepo.find({
      where: { seller_id: sellerId },
      relations: ['buyer', 'listing'],
      order: { createdAt: 'DESC' },
    });
    return ratings.map(rating => this.serializeRating(rating));
  }

  async getBuyerRatingState(listingId: string, buyerId: string) {
    if (!listingId || !buyerId) return null;

    const listing = await this.listingRepo.findOne({
      where: { id: listingId },
      withDeleted: true,
    });
    if (!listing || listing.sold_to_user_id !== buyerId) return null;

    const existing = await this.ratingRepo.findOne({
      where: { listing_id: listingId, buyer_id: buyerId },
    });

    return {
      listingId,
      sellerId: listing.seller_id,
      canRate: listing.status === ListingStatus.SOLD && !existing,
      hasRated: !!existing,
      ratingId: existing?.id,
      ratingValue: existing?.rating,
      review: existing?.review,
    };
  }

  private async refreshSellerAggregate(sellerId: string) {
    const { average = 0, total = 0 } =
      (await this.ratingRepo
        .createQueryBuilder('rating')
        .select('AVG(rating.rating)', 'average')
        .addSelect('COUNT(rating.id)', 'total')
        .where('rating.seller_id = :sellerId', { sellerId })
        .getRawOne<{ average?: string; total?: string }>()) ?? {};

    const numericAverage = average ? Number(average) : 0;
    const numericTotal = total ? Number(total) : 0;

    let profile = await this.profileRepo.findOne({ where: { user_id: sellerId } });
    if (!profile) {
      profile = this.profileRepo.create({ user_id: sellerId });
    }

    profile.rating = numericAverage.toFixed(2);
    profile.total_ratings = numericTotal;
    await this.profileRepo.save(profile);
  }

  private serializeRating(rating: SellerRating | null) {
    if (!rating) return rating;

    const buyer = rating.buyer ? this.pickSafeUser(rating.buyer) : undefined;
    return { ...rating, buyer };
  }

  private pickSafeUser(user: User) {
    const { user_id, first_name, last_name, mun_email, profile_picture_url } = user;
    return { user_id, first_name, last_name, mun_email, profile_picture_url };
  }
}
