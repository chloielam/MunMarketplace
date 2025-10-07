import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './entities/listing.entity';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing]), // repository for Listing entity
  ],
  controllers: [ListingController],
  providers: [ ListingService ],
  exports: [ ListingService ], // allow other modules (e.g., Orders) to use ListingService
})
export class ListingModule {}