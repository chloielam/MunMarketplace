import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { QueryListingDto } from './dto/query-listing.dto';
import { ListingService } from './listing.service';

@Controller('listings')
export class ListingController {
  constructor(private readonly service: ListingService) {}

  @Get()
  findMany(@Query() query: QueryListingDto) {
    return this.service.findMany(query);
  }
  
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const listing = await this.service.findOneById(id);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return listing;
  }
}