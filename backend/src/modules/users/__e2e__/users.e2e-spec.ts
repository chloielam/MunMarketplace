import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';

const UUID = '11111111-1111-1111-1111-111111111111';

describe('Users E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/GET users/:id → should return 404', async () => {
    return request(app.getHttpServer()).get(`/users/${UUID}`).expect(404);
  });

  it('/GET users/:id/profile → should return 404', async () => {
    return request(app.getHttpServer())
      .get(`/users/${UUID}/profile`)
      .expect(404);
  });

  it('/PATCH users/:id → should return 404', async () => {
    return request(app.getHttpServer())
      .patch(`/users/${UUID}`)
      .send({ first_name: 'Aditi' })
      .expect(404);
  });

  it('/PATCH users/:id/profile → should return 404', async () => {
    return request(app.getHttpServer())
      .patch(`/users/${UUID}/profile`)
      .send({ bio: 'Hello' })
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
