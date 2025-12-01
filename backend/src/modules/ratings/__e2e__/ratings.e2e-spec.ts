import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';

describe('Ratings E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /ratings/:sellerId/:buyerId', async () => {
    return request(app.getHttpServer())
      .post('/ratings/seller-123/buyer-123')
      .send({ listingId: 'listing-123', rating: 5, review: 'Great seller!' })
      .expect(201);
  });

  it('GET /ratings/:sellerId', async () => {
    return request(app.getHttpServer())
      .get('/ratings/seller-123')
      .expect(200);
  });

  it('GET /ratings/state/:listingId/:buyerId', async () => {
    return request(app.getHttpServer())
      .get('/ratings/state/listing-123/buyer-123')
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
