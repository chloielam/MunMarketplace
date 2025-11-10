import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailerService } from '../common/mailer.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OtpCode } from './otp.entity';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService - changePassword', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockOtpRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
    findOneWithPassword: jest.fn(),
    setPassword: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockMailerService = {
    sendOtp: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'OTP_TTL_MINUTES') return '10';
      if (key === 'MAX_OTPS_PER_HOUR') return '5';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(OtpCode),
          useValue: mockOtpRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changePassword', () => {
    const userId = 'test-user-id';
    const currentPassword = 'oldPassword123';
    const newPassword = 'newPassword123';
    const hashedOldPassword = 'hashedOldPassword';
    const hashedNewPassword = 'hashedNewPassword';

    it('should successfully change password when current password is correct', async () => {
      const mockUser = {
        user_id: userId,
        mun_email: 'test@mun.ca',
        first_name: 'Test',
      };

      const mockUserWithPassword = {
        user_id: userId,
        mun_email: 'test@mun.ca',
        password_hash: hashedOldPassword,
        is_email_verified: true,
        first_name: 'Test',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.findOneWithPassword.mockResolvedValue(mockUserWithPassword);
      mockUsersService.setPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);

      const result = await service.changePassword(userId, currentPassword, newPassword);

      expect(result).toEqual({ message: 'Password changed successfully' });
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(mockUsersService.findOneWithPassword).toHaveBeenCalledWith(userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, hashedOldPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUsersService.setPassword).toHaveBeenCalledWith('test@mun.ca', hashedNewPassword);
    });

    it('should throw BadRequestException when user is not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('User not found');
    });

    it('should throw BadRequestException when password is not set for account', async () => {
      const mockUser = {
        user_id: userId,
        mun_email: 'test@mun.ca',
        first_name: 'Test',
      };

      const mockUserWithPassword = {
        user_id: userId,
        mun_email: 'test@mun.ca',
        password_hash: null,
        is_email_verified: true,
        first_name: 'Test',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.findOneWithPassword.mockResolvedValue(mockUserWithPassword);

      await expect(
        service.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('Password not set for this account');
    });

    it('should throw BadRequestException when current password is incorrect', async () => {
      const mockUser = {
        user_id: userId,
        mun_email: 'test@mun.ca',
        first_name: 'Test',
      };

      const mockUserWithPassword = {
        user_id: userId,
        mun_email: 'test@mun.ca',
        password_hash: hashedOldPassword,
        is_email_verified: true,
        first_name: 'Test',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.findOneWithPassword.mockResolvedValue(mockUserWithPassword);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changePassword(userId, currentPassword, newPassword)
      ).rejects.toThrow('Current password is incorrect');
    });
  });
});

