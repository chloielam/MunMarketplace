// src/modules/listings/__e2e__/listing.e2e-spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Server as NodeServer } from 'http';
import type { Server as HttpServer } from 'http';
import { Repository } from 'typeorm';

import { ListingModule } from '../listing.module';
import { Listing, ListingStatus } from '../entities/listing.entity';
import { User } from '../../users/entities/user.entity';

jest.setTimeout(20000);

interface ListingItemPayload {
  title: string;
  category: string;
  [key: string]: unknown;
}

interface ListingResponsePayload {
  items: ListingItemPayload[];
  total: number;
}

const isHttpServer = (value: unknown): value is HttpServer =>
  value instanceof NodeServer ||
  (typeof value === 'object' &&
    value !== null &&
    'listen' in value &&
    typeof (value as { listen: unknown }).listen === 'function');

const ensureHttpServer = (appInstance: INestApplication): HttpServer => {
  const server = appInstance.getHttpServer() as unknown;
  if (isHttpServer(server)) return server;
  throw new Error('Unexpected HTTP server instance');
};

const isListingResponsePayload = (
  payload: unknown,
): payload is ListingResponsePayload => {
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('items' in payload) ||
    !('total' in payload)
  ) {
    return false;
  }
  const { items, total } = payload as {
    items: unknown;
    total: unknown;
  };
  if (!Array.isArray(items) || typeof total !== 'number') {
    return false;
  }
  return items.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      'title' in item &&
      'category' in item &&
      typeof (item as { title: unknown }).title === 'string' &&
      typeof (item as { category: unknown }).category === 'string',
  );
};

describe('Listings E2E', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    httpServer = ensureHttpServer(app);

    // Seed: User first (for FK), then Listing
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const user = await userRepo.save({
      mun_email: 'test@mun.ca',
      password_hash: 'x',
      first_name: 'Test',
      last_name: 'User',
      is_email_verified: true,
      is_active: true,
    });

    const listingRepo = app.get<Repository<Listing>>(
      getRepositoryToken(Listing),
    );
    await listingRepo.save({
      title: 'Desk',
      description: 'Great condition',
      price: '50.00',
      currency: 'CAD',
      category: 'Furniture',
      city: 'St. John’s',
      campus: 'MUN-StJohns',
      imageUrls: ['https://picsum.photos/seed/desk/400/300'],
      seller_id: user.user_id, // valid FK
      status: ListingStatus.ACTIVE,
    });
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /listings returns items with pagination wrapper', async () => {
    const res = await request(httpServer).get('/listings').expect(200);
    const body = res.body as unknown;
    if (!isListingResponsePayload(body)) {
      throw new Error('Unexpected listings response shape');
    }
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.total).toBeGreaterThanOrEqual(1);
    expect(body.items[0]?.title).toBe('Desk');
  });

  it('GET /listings filter by category', async () => {
    const res = await request(httpServer)
      .get('/listings?category=Furniture')
      .expect(200);

    const body = res.body as unknown;
    if (!isListingResponsePayload(body)) {
      throw new Error('Unexpected listings response shape');
    }
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(body.items[0]?.category).toBe('Furniture');
  });
});
