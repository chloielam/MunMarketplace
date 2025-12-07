import { Test } from '@nestjs/testing';
import { ListingController } from '../listing.controller';
import { ListingService } from '../listing.service';

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
    await ctrl.findMany({ category: 'Furniture' } as any);
    expect(service.findMany).toHaveBeenCalledWith({ category: 'Furniture' });
  });
});
