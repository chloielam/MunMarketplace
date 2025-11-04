import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './entities/listing.entity';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { UserListingController } from './user-listing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing]), // repository for Listing entity
  ],
  controllers: [ListingController, UserListingController],
  providers: [ListingService],
  exports: [ListingService], // allow other modules (e.g., Orders) to use ListingService
})
export class ListingModule {}
