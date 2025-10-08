import { Controller, Get, Param, Patch, Body, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

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