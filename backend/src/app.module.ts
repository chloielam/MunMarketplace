import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './modules/listings/entities/listing.entity';
import { User } from './modules/users/entities/user.entity';
import { UserProfile } from './modules/users/entities/user-profile.entity';
import { AuthModule } from './auth/auth.module';

import { ListingModule } from './modules/listings/listing.module';
// import UsersModule if you have it

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      // Dev only: auto-sync tables. Use migrations later.
      synchronize: true,
      autoLoadEntities: true,
      entities: [Listing, User, UserProfile],
    }),
    ListingModule,
  ],
})
export class AppModule {}
