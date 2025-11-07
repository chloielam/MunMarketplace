import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SeedUserDto } from './dto/seed-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Controller('test-support')
export class TestSupportController {
  constructor(private readonly users: UsersService) {}

  private ensureEnabled() {
    const isProduction = process.env.NODE_ENV === 'production';
    const explicitDisable = process.env.ENABLE_TEST_SUPPORT === 'false';

    if (isProduction || explicitDisable) {
      throw new NotFoundException();
    }
  }

  @Post('seed-user')
  async seedUser(@Body() dto: SeedUserDto) {
    this.ensureEnabled();

    if (!dto.email.endsWith('@mun.ca')) {
      throw new BadRequestException('Only MUN email addresses allowed');
    }

    const existing = await this.users.findOrCreate(dto.email, dto.firstName);

    if (dto.password) {
      const hash = await bcrypt.hash(dto.password, 10);
      await this.users.setPassword(dto.email, hash);
    }

    const updates: UpdateUserDto = {};
    if (dto.firstName) updates.first_name = dto.firstName;
    if (dto.lastName) updates.last_name = dto.lastName;
    if (Object.keys(updates).length) {
      await this.users.updateUser(existing.user_id, updates);
    }

    if (dto.verified !== false) {
      await this.users.markVerified(dto.email);
    }

    const user = await this.users.findByEmail(dto.email);
    const safeUser: Record<string, unknown> = { ...(user ?? {}) };
    delete safeUser['password_hash'];

    return {
      message: 'Seeded user',
      user: safeUser,
    };
  }
}
