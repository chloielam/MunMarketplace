import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { SellerRatingsService } from '../../ratings/seller-ratings.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: any;

  beforeEach(async () => {
    service = {
      findOne: jest.fn(),
      findProfile: jest.fn(),
      updateUser: jest.fn(),
      upsertProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: service },
        { provide: SellerRatingsService, useValue: {} }, // mock
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('delegates to service.findOne', async () => {
    service.findOne.mockResolvedValue({ user_id: '123' });
    await controller.getUser('123');
    expect(service.findOne).toHaveBeenCalledWith('123');
  });

  it('delegates to service.findProfile', async () => {
    service.findProfile.mockResolvedValue({ user_id: '123', bio: 'Hi' });
    await controller.getProfile('123');
    expect(service.findProfile).toHaveBeenCalledWith('123');
  });

  it('delegates to updateUser', async () => {
    const body = { first_name: 'Aditi' };
    service.updateUser.mockResolvedValue(body);

    await controller.updateUser('123', body);
    expect(service.updateUser).toHaveBeenCalledWith('123', body);
  });

  it('delegates to upsertProfile', async () => {
    const body = { bio: 'hello' };
    service.upsertProfile.mockResolvedValue(body);

    await controller.updateProfile('123', body);
    expect(service.upsertProfile).toHaveBeenCalledWith('123', body);
  });
});
