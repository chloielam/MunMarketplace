import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SessionUserId } from '../auth/session-user.decorator';
import { SellerRatingsService } from '../ratings/seller-ratings.service';
import { CreateSellerRatingDto } from '../ratings/dto/create-seller-rating.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly sellerRatings: SellerRatingsService,
  ) {}

  @Get('me')
  getMe(@SessionUserId() userId: string) {
    return this.users.findOne(userId);
  }

  @Get('me/profile')
  getMyProfile(@SessionUserId() userId: string) {
    return this.users.findProfile(userId);
  }

  @Get(':id/ratings')
  getRatings(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sellerRatings.getSellerRatings(id);
  }

  // GET /users/:id  => basic user info
  @Get(':id')
  getUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.findOne(id);
  }

  // GET /users/:id/profile  => profile info
  @Get(':id/profile')
  getProfile(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.findProfile(id);
  }

  // IMPORTANT: Specific routes ('me') must come BEFORE parameterized routes (':id')
  // to ensure proper route matching
  @Patch('me')
  updateMe(@SessionUserId() userId: string, @Body() body: UpdateUserDto) {
    return this.users.updateUser(userId, body);
  }

  @Patch('me/profile')
  updateMyProfile(
    @SessionUserId() userId: string,
    @Body() body: UpdateProfileDto,
  ) {
    return this.users.upsertProfile(userId, body);
  }

  @Post(':id/ratings')
  rateSeller(
    @Param('id', new ParseUUIDPipe()) sellerId: string,
    @SessionUserId() buyerId: string,
    @Body() body: CreateSellerRatingDto,
  ) {
    return this.sellerRatings.rateSeller(buyerId, sellerId, body);
  }

  // PATCH /users/:id  => edit basic user fields (no password/email here)
  @Patch(':id')
  updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.users.updateUser(id, body);
  }

  // PATCH /users/:id/profile  => create/update profile fields
  @Patch(':id/profile')
  updateProfile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateProfileDto,
  ) {
    return this.users.upsertProfile(id, body);
  }
}
