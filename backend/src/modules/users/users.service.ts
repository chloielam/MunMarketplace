import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserProfile) private readonly profileRepo: Repository<UserProfile>,
  ) {}

  async findOne(user_id: string) {
    const user = await this.userRepo.findOne({ where: { user_id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findProfile(user_id: string) {
    const profile = await this.profileRepo.findOne({ where: { user_id } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateUser(user_id: string, dto: UpdateUserDto) {
    await this.findOne(user_id); // ensure exists
    await this.userRepo.update({ user_id }, dto);
    // return selected fields, not password_hash
    const { password_hash, ...safe } = await this.findOne(user_id) as any;
    return safe;
  }

  async upsertProfile(user_id: string, dto: UpdateProfileDto) {
    // Convert rating number → string with 2 decimals to fit DECIMAL(3,2)
    const ratingStr = dto.rating != null ? dto.rating.toFixed(2) : undefined;

    let profile = await this.profileRepo.findOne({ where: { user_id } });
    if (!profile) {
      profile = this.profileRepo.create({ user_id });
    }
    Object.assign(profile, { ...dto, rating: ratingStr ?? profile?.rating });
    return this.profileRepo.save(profile);
  }
}