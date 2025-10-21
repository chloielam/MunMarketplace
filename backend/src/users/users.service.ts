import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async create(email: string, fullName = '') {
    const user = this.usersRepo.create({ email, fullName, isVerified: false });
    return this.usersRepo.save(user);
  }

  async findOrCreate(email: string, fullName = '') {
    let user = await this.findByEmail(email);
    if (!user) user = await this.create(email, fullName);
    return user;
  }

  async setPassword(email: string, hash: string) {
    await this.usersRepo.update({ email }, { passwordHash: hash });
    return this.findByEmail(email);
  }

  async markVerified(email: string) {
    await this.usersRepo.update({ email }, { isVerified: true });
    return this.findByEmail(email);
  }
}
