import { Test } from '@nestjs/testing';
import { SellerRatingsService } from '../src/ratings/seller-ratings.service';
import { Repository } from 'typeorm';
import { SellerRating } from '../src/ratings/entities/seller-rating.entity';
import { Listing, ListingStatus } from '../src/listings/entities/listing.entity';
import { UserProfile } from '../src/users/entities/user-profile.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('SellerRatingsService', () => {
  let service: SellerRatingsService;
  let ratingRepo: Repository<SellerRating>;
  let listingRepo: Repository<Listing>;
  let profileRepo: Repository<UserProfile>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SellerRatingsService,
        { provide: getRepositoryToken(SellerRating), useValue: createMockRepo() },
        { provide: getRepositoryToken(Listing), useValue: createMockRepo() },
        { provide: getRepositoryToken(UserProfile), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get(SellerRatingsService);
    ratingRepo = module.get(getRepositoryToken(SellerRating));
    listingRepo = module.get(getRepositoryToken(Listing));
    profileRepo = module.get(getRepositoryToken(UserProfile));
  });

  const createMockRepo = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ average: '4.0', total: '1' }),
    }),
  });

  it('throws if buyer rates themselves', async () => {
    await expect(
      service.rateSeller('A', 'A', { rating: 5, listingId: 'L1' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws if listing not found', async () => {
    listingRepo.findOne.mockResolvedValue(null);

    await expect(
      service.rateSeller('B', 'A', { rating: 5, listingId: '123' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates a new rating when conditions are correct', async () => {
    listingRepo.findOne.mockResolvedValue({
      id: 'L1',
      seller_id: 'A',
      sold_to_user_id: 'B',
      status: ListingStatus.SOLD,
    });

    ratingRepo.findOne.mockResolvedValue(null);
    ratingRepo.create.mockReturnValue({
      id: 'NEW',
      buyer_id: 'B',
      seller_id: 'A',
      listing_id: 'L1',
      rating: 5,
    });
    ratingRepo.save.mockResolvedValue({ id: 'NEW' });

    const result = await service.rateSeller('B', 'A', { rating: 5, listingId: 'L1' });
    expect(ratingRepo.create).toHaveBeenCalled();
    expect(ratingRepo.save).toHaveBeenCalled();
    expect(result.id).toBe('NEW');
  });
});
