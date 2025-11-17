import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerRating } from './entities/seller-rating.entity';
import { SellerRatingsService } from './seller-ratings.service';
import { Listing } from '../listings/entities/listing.entity';
import { UserProfile } from '../users/entities/user-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SellerRating, Listing, UserProfile])],
  providers: [SellerRatingsService],
  exports: [SellerRatingsService],
})
export class SellerRatingsModule {}
