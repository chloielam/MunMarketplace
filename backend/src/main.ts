import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // set a global prefix for all routes
  app.setGlobalPrefix('api');

  // optional CORS if frontend is on a different port
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log('🚀 Server running on http://localhost:${port}/api');
}
bootstrap();