import { Test } from '@nestjs/testing';
import { ListingController } from '../listing.controller';
import { ListingService } from '../listing.service';
import { QueryListingDto } from '../dto/query-listing.dto';

describe('ListingController', () => {
  it('delegates to service with query', async () => {
    const service = {
      findMany: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    };
    const module = await Test.createTestingModule({
      controllers: [ListingController],
      providers: [{ provide: ListingService, useValue: service }],
    }).compile();

    const ctrl = module.get(ListingController);
    const query: QueryListingDto = { category: 'Furniture' };
    await ctrl.findMany(query);
    expect(service.findMany).toHaveBeenCalledWith({ category: 'Furniture' });
  });
});
