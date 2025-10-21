// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { ListingModule } from './modules/listings/listing.module';
import { ChatModule } from './modules/chat/chat.module';

import { User } from './modules/users/entities/user.entity';
import { UserProfile } from './modules/users/entities/user-profile.entity';
import { Listing } from './modules/listings/entities/listing.entity';
import { Message } from './modules/chat/entities/chat-message';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql',
      port: 3306,
      username: 'mun_user',
      password: 'mun_pass',
      database: 'mun_marketplace',
      entities: [User, UserProfile, Listing, Message], // include all entities
      synchronize: true, // automatically create tables
    }),
    UsersModule,
    ListingModule,
    ChatModule,
  ],
})
export class AppModule {}
