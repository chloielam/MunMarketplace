import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

import { ListingModule } from './modules/listing/listing.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,ListingModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}





