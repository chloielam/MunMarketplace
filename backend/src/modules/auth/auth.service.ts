import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { OtpCode } from './otp.entity';
import { MailerService } from '../common/mailer.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private otpTtlMs: number;
  private maxOtpsPerHour: number;
  private maxAttempts = 5;

  constructor(
    @InjectRepository(OtpCode) private otpRepo: Repository<OtpCode>,
    private mailer: MailerService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.otpTtlMs = (Number(this.config.get('OTP_TTL_MINUTES') || 10)) * 60 * 1000;
    this.maxOtpsPerHour = Number(this.config.get('MAX_OTPS_PER_HOUR') || 5);
  }

  private genCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(mun_email: string) {
    if (!mun_email.endsWith('@mun.ca')) throw new BadRequestException('Only MUN email addresses allowed');

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentCount = await this.otpRepo.count({ where: { mun_email, createdAt: MoreThan(new Date(oneHourAgo)) } });
    if (recentCount >= this.maxOtpsPerHour) throw new ForbiddenException('Too many requests');

    const raw = this.genCode();
    const codeHash = await bcrypt.hash(raw, 10);
    const expiresAt = Date.now() + this.otpTtlMs;

    const otp = this.otpRepo.create({ mun_email, codeHash, expiresAt });
    await this.otpRepo.save(otp);

    await this.mailer.sendOtp(mun_email, raw);

    return { message: 'OTP sent' };
  }

  async verifyOtp(mun_email: string, code: string) {
    const otp = await this.otpRepo.findOne({ where: { mun_email, used: false }, order: { createdAt: 'DESC' } });
    if (!otp) throw new BadRequestException('No OTP found');

    if (otp.expiresAt < Date.now()) throw new BadRequestException('OTP expired');

    if (otp.attempts >= this.maxAttempts) throw new ForbiddenException('Too many attempts');

    const ok = await bcrypt.compare(code, otp.codeHash);
    if (!ok) {
      otp.attempts += 1;
      await this.otpRepo.save(otp);
      throw new BadRequestException('Invalid OTP');
    }

    otp.used = true;
    await this.otpRepo.save(otp);

    // create or mark verified
    const user = await this.usersService.findOrCreate(mun_email);
    await this.usersService.markVerified(mun_email);

    return { message: 'Verified' };
  }

  // register after verification: set password and full name
  async register(mun_email: string, first_name: string, password_hash: string) {
    const user = await this.usersService.findByEmail(mun_email);
    if (!user || !user.is_email_verified) throw new BadRequestException('Email not verified');
    const hash = await bcrypt.hash(password_hash, 10);
    await this.usersService.setPassword(mun_email, hash);
    // Update the user's first_name as well
    await this.usersService.updateUser(user.user_id, { first_name });
    return { message: 'Registered' };
  }

  async login(mun_email: string, password_hash: string) {
    const user = await this.usersService.findByEmail(mun_email);
    if (!user || !user.password_hash) throw new BadRequestException('Invalid credentials');

    // need to select passwordHash (select:false). We'll query directly:
    const userWithPwd = await this.usersService['userRepo'].findOne({ where: { mun_email }, select: ['user_id','mun_email','password_hash','is_email_verified','first_name'] });
    if (!userWithPwd) throw new BadRequestException('Invalid credentials');

    const ok = await bcrypt.compare(password_hash, userWithPwd.password_hash || '');
    if (!ok) throw new BadRequestException('Invalid credentials');

    if (!userWithPwd.is_email_verified) throw new BadRequestException('Email not verified');

    const token = this.jwtService.sign({ sub: userWithPwd.user_id, email: userWithPwd.mun_email });
    return { access_token: token, user: this.toPublicUser(userWithPwd as User) };
  }

  async getSessionUser(userId: string | undefined) {
    if (!userId) return null;
    try {
      const user = await this.usersService.findOne(userId);
      return this.toPublicUser(user);
    } catch (error) {
      if (error instanceof NotFoundException) return null;
      throw error;
    }
  }

  async forgotPassword(mun_email: string) {
    // only send if user exists
    const user = await this.usersService.findByEmail(mun_email);
    if (!user) throw new BadRequestException('Email not registered');
    return this.sendOtp(mun_email);
  }

  async resetPassword(mun_email: string, code: string, newPassword: string) {
    // verify OTP
    const otp = await this.otpRepo.findOne({ where: { mun_email, used: false }, order: { createdAt: 'DESC' } });
    if (!otp) throw new BadRequestException('No OTP found');
    if (otp.expiresAt < Date.now()) throw new BadRequestException('OTP expired');

    const ok = await bcrypt.compare(code, otp.codeHash);
    if (!ok) throw new BadRequestException('Invalid OTP');

    otp.used = true;
    await this.otpRepo.save(otp);

    const hash = await bcrypt.hash(newPassword, 10);
    await this.usersService.setPassword(mun_email, hash);

    return { message: 'Password reset successful' };
  }

  private toPublicUser(user: User | (Partial<User> & { user_id: string; mun_email: string })) {
    if (!user) return null;
    return {
      id: user.user_id,
      email: user.mun_email,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePictureUrl: user.profile_picture_url,
    };
  }
}
