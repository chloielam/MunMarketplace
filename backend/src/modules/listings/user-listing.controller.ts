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
import { SessionUserId } from '../auth/session-user.decorator';

@Controller('me/listings')
export class UserListingController {
  constructor(private readonly listings: ListingService) {}

  @Get()
  findUserListings(
    @SessionUserId() userId: string,
    @Query() query: QueryOwnListingsDto,
  ) {
    return this.listings.findBySeller(userId, query);
  }

  @Post()
  createListing(
    @SessionUserId() userId: string,
    @Body() body: CreateListingDto,
  ) {
    return this.listings.createListing(userId, body);
  }

  @Get(':listingId')
  findOneListing(
    @Param('listingId', new ParseUUIDPipe()) listingId: string,
    @SessionUserId() userId: string,
  ) {
    return this.listings.findOneForSeller(listingId, userId);
  }

  @Patch(':listingId')
  updateListing(
    @Param('listingId', new ParseUUIDPipe()) listingId: string,
    @SessionUserId() userId: string,
    @Body() body: UpdateListingDto,
  ) {
    return this.listings.updateListing(listingId, userId, body);
  }

  @Delete(':listingId')
  @HttpCode(204)
  removeListing(
    @Param('listingId', new ParseUUIDPipe()) listingId: string,
    @SessionUserId() userId: string,
  ) {
    return this.listings.removeListing(listingId, userId);
  }
}

