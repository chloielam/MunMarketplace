// test/app.e2e-spec.ts
import request from 'supertest'; // ✅ default import
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Server as NodeServer } from 'http';
import type { Server as HttpServer } from 'http';

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

describe('App (e2e)', () => {
  let app: INestApplication;
  let httpServer: HttpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = ensureHttpServer(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', async () => {
    // If you don't have a /health route, either add one or change this path.
    return request(httpServer).get('/health').expect(200).expect({ ok: true });
  });
});
