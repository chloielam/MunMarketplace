import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // set a global prefix for all routes
  app.setGlobalPrefix('api');

  // optional CORS if frontend is on a different port
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  Logger.log('🚀 Server running on http://localhost:${port}/api');
}
bootstrap();