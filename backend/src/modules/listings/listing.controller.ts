import { Controller, Get, Query } from '@nestjs/common';
import { QueryListingDto } from './dto/query-listing.dto';
import { ListingService } from './listing.service';

@Controller('listings')
export class ListingController {
  constructor(private readonly service: ListingService) {}

  @Get()
  findMany(@Query() query: QueryListingDto) {
    return this.service.findMany(query);
  }
}