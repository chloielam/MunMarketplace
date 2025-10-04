import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create a new user
  async createUser(name: string, email: string, role: UserRole = UserRole.BUYER, password?: string) {
    const user = this.userRepository.create({
      name,
      email,
      role,
      password,
    });
    return this.userRepository.save(user);
  }

  // Get all users
  async findAll() {
    return this.userRepository.find();
  }

  // Find user by email
  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
}
