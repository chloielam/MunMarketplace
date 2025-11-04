import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as session from 'express-session';
import { TypeormStore } from 'connect-typeorm';
import { DataSource } from 'typeorm';
import { Session as SessionEntity } from './modules/auth/entities/session.entity';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const dataSource = app.get(DataSource);
  const sessionRepository = dataSource.getRepository(SessionEntity);
  const sessionTtlMs = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 24 * 7); // default 7 days
  const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'mun.sid';
  const sessionSecret = process.env.SESSION_SECRET || 'change-me-in-env';
  const sameSite = (process.env.SESSION_SAME_SITE as session.CookieOptions['sameSite']) ??
    (process.env.NODE_ENV === 'production' ? 'none' : 'lax');

  app.use(
    session({
      name: sessionCookieName,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        maxAge: sessionTtlMs,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite,
      },
      store: new TypeormStore({
        cleanupLimit: 2,
        ttl: Math.floor(sessionTtlMs / 1000),
      }).connect(sessionRepository),
    }),
  );

  // set a global prefix for all routes
  app.setGlobalPrefix('api');

  // optional CORS if frontend is on a different port
  const corsOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Server running on http://localhost:${port}/api`);
}
bootstrap();
