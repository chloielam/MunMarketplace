// src/modules/listings/__e2e__/listing.e2e-spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';

import { ListingModule } from '../listing.module';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { User } from '../../users/entities/user.entity';

jest.setTimeout(20000);

describe('Listings E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [
        // DB connection with both entities
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Listing, User],
          synchronize: true,
          dropSchema: true,
        }),
        // Repositories we will request directly in the test:
        TypeOrmModule.forFeature([User, Listing]),
        // Feature under test
        ListingModule,
      ],
    }).compile();

    app = modRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Seed: User first (for FK), then Listing
    const userRepo = app.get(getRepositoryToken(User));
    const user = await userRepo.save({
      mun_email: 'test@mun.ca',
      password_hash: 'x',
      first_name: 'Test',
      last_name: 'User',
      is_email_verified: true,
      is_active: true,
    });

    const listingRepo = app.get(getRepositoryToken(Listing));
    await listingRepo.save({
      title: 'Desk',
      description: 'Great condition',
      price: '50.00',
      currency: 'CAD',
      category: 'Furniture',
      city: "St. John’s",
      campus: 'MUN-StJohns',
      imageUrls: ['https://picsum.photos/seed/desk/400/300'],
      seller_id: user.user_id,            // valid FK
      status: ListingStatus.ACTIVE,
    });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /listings returns items with pagination wrapper', async () => {
    const res = await request(app.getHttpServer()).get('/listings').expect(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.items[0].title).toBe('Desk');
  });

  it('GET /listings filter by category', async () => {
    const res = await request(app.getHttpServer())
      .get('/listings?category=Furniture')
      .expect(200);

    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.items[0].category).toBe('Furniture');
  });
});