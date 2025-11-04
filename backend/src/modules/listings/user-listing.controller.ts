import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryOwnListingsDto } from './dto/query-own-listings.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingService } from './listing.service';

@Controller('users/:userId/listings')
export class UserListingController {
  constructor(private readonly listings: ListingService) {}

  @Get()
  findUserListings(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query() query: QueryOwnListingsDto,
  ) {
    return this.listings.findBySeller(userId, query);
  }

  @Post()
  createListing(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() body: CreateListingDto,
  ) {
    return this.listings.createListing(userId, body);
  }

  @Get(':listingId')
  findOneListing(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('listingId', new ParseUUIDPipe()) listingId: string,
  ) {
    return this.listings.findOneForSeller(listingId, userId);
  }

  @Patch(':listingId')
  updateListing(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('listingId', new ParseUUIDPipe()) listingId: string,
    @Body() body: UpdateListingDto,
  ) {
    return this.listings.updateListing(listingId, userId, body);
  }

  @Delete(':listingId')
  @HttpCode(204)
  removeListing(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('listingId', new ParseUUIDPipe()) listingId: string,
  ) {
    return this.listings.removeListing(listingId, userId);
  }
}
