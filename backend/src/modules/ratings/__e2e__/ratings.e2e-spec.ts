import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';

const UUID = '11111111-1111-1111-1111-111111111111';

describe('Ratings E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /ratings → should return 404 (route does not exist)', async () => {
    return request(app.getHttpServer())
      .post(`/ratings/${UUID}/${UUID}`)
      .send({ listingId: UUID, rating: 5 })
      .expect(404);
  });

  it('GET /ratings/:sellerId → 404', async () => {
    return request(app.getHttpServer())
      .get(`/ratings/${UUID}`)
      .expect(404);
  });

  it('GET /ratings/state/... → 404', async () => {
    return request(app.getHttpServer())
      .get(`/ratings/state/${UUID}/${UUID}`)
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
