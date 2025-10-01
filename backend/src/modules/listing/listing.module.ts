import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './entities/listing.entity';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { ListingServiceMock } from './listing.service.mock';

const useMock = process.env.MOCK_DATA === '1';

@Module({
//   imports: [
//     TypeOrmModule.forFeature([Listing]), // repository for Listing entity
//   ],
  controllers: [ListingController],
  providers: [ useMock ? { provide: ListingService, useClass: ListingServiceMock } : ListingService ],
  exports: [ListingService], // allow other modules (e.g., Orders) to use ListingService
})
export class ListingModule {}