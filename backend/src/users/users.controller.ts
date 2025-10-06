import { Controller, Post, Body, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async createUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('role') role: UserRole,
    @Body('password') password?: string,
  ) {
    return this.usersService.createUser(name, email, role, password);
  }

  @Get()
  async getAllUsers() {
    return this.usersService.findAll();
  }
}
