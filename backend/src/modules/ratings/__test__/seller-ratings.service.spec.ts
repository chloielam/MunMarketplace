import { Test } from '@nestjs/testing';
import { SellerRatingsService } from '../seller-ratings.service';
import { Repository } from 'typeorm';
import { SellerRating } from '../entities/seller-rating.entity';
import { Listing, ListingStatus } from '../../listings/entities/listing.entity';
import { UserProfile } from '../../users/entities/user-profile.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SellerRatingsService', () => {
  let service: SellerRatingsService;
  let ratingRepo: jest.Mocked<Repository<SellerRating>>;
  let listingRepo: jest.Mocked<Repository<Listing>>;
  let profileRepo: jest.Mocked<Repository<UserProfile>>;

  // ------------------------------
  // MOCK REPOSITORY FACTORY
  // ------------------------------
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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SellerRatingsService,
        {
          provide: getRepositoryToken(SellerRating),
          useValue: createMockRepo(),
        },
        { provide: getRepositoryToken(Listing), useValue: createMockRepo() },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: createMockRepo(),
        },
      ],
    }).compile();

    service = module.get(SellerRatingsService);
    ratingRepo = module.get(getRepositoryToken(SellerRating));
    listingRepo = module.get(getRepositoryToken(Listing));
    profileRepo = module.get(getRepositoryToken(UserProfile));
  });

  // ----------------------------------------------------
  // TEST 1 — buyer cannot rate themselves
  // ----------------------------------------------------
  it('throws if buyer rates themselves', async () => {
    await expect(
      service.rateSeller('A', 'A', { rating: 5, listingId: 'L1' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  // ----------------------------------------------------
  // TEST 2 — listing must exist
  // ----------------------------------------------------
  it('throws if listing not found', async () => {
    listingRepo.findOne.mockResolvedValue(null);

    await expect(
      service.rateSeller('B', 'A', { rating: 5, listingId: '123' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  // ----------------------------------------------------
  // TEST 3 — happy path: create rating + update profile
  // ----------------------------------------------------
  it('creates a new rating when conditions are correct', async () => {
    // Mock listing returned
    listingRepo.findOne.mockResolvedValue({
      id: 'L1',
      seller_id: 'A',
      sold_to_user_id: 'B',
      status: ListingStatus.SOLD,
    });

    // Mock no previous rating
    ratingRepo.findOne.mockResolvedValue(null);

    // Mock rating creation
    ratingRepo.create.mockReturnValue({
      id: 'NEW',
      buyer_id: 'B',
      seller_id: 'A',
      listing_id: 'L1',
      rating: 5,
    });

    ratingRepo.save.mockResolvedValue({ id: 'NEW' });

    // ⭐ FIX: Mock seller profile so refreshSellerAggregate() does not crash
    profileRepo.findOne.mockResolvedValue({
      id: 'PROFILE123',
      rating: '4.0',
      total_ratings: 1,
    });

    profileRepo.save.mockResolvedValue({});

    const result = await service.rateSeller('B', 'A', {
      rating: 5,
      listingId: 'L1',
    });

    expect(ratingRepo.create).toHaveBeenCalled();
    expect(ratingRepo.save).toHaveBeenCalled();
    expect(profileRepo.save).toHaveBeenCalled(); // ensure profile updated
    expect(result.id).toBe('NEW');
  });
});
