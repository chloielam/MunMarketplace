import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';

describe('Users E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // spins full app
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/GET users/:id', () => {
    return request(app.getHttpServer())
      .get('/users/123')
      .expect(200);
  });

  it('/GET users/:id/profile', () => {
    return request(app.getHttpServer())
      .get('/users/123/profile')
      .expect(200);
  });

  it('/PATCH users/:id', () => {
    return request(app.getHttpServer())
      .patch('/users/123')
      .send({ first_name: 'Aditi' })
      .expect(200);
  });

  it('/PATCH users/:id/profile', () => {
    return request(app.getHttpServer())
      .patch('/users/123/profile')
      .send({ bio: 'Hello' })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
