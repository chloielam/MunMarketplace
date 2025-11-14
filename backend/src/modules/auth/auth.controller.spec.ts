import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController - changePassword', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('changePassword', () => {
    it('should call authService.changePassword with correct parameters', async () => {
      const userId = 'test-user-id';
      const dto = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };
      const expectedResult = { message: 'Password changed successfully' };

      mockAuthService.changePassword.mockResolvedValue(expectedResult);

      // Mock SessionUserId decorator
      const result = await controller.changePassword(userId, dto);

      expect(authService.changePassword).toHaveBeenCalledWith(
        userId,
        dto.currentPassword,
        dto.newPassword
      );
      expect(result).toEqual(expectedResult);
    });
  });
});

