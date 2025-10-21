import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing } from './modules/listings/entities/listing.entity';
import { User } from './modules/users/entities/user.entity';
import { UserProfile } from './modules/users/entities/user-profile.entity';
import { UsersModule } from './modules/users/users.module';
import { ListingModule } from './modules/listings/listing.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { OtpCode } from './auth/otp.entity';

const ENTITIES = [Listing, User, UserProfile, OtpCode];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isTest = process.env.NODE_ENV === 'test';

        if (isTest) {
          // 🔁 SQLite for tests
          return {
            type: 'sqlite' as const,
            database: ':memory:',
            entities: ENTITIES,
            synchronize: true,       // ok in tests
            dropSchema: true,        // clean slate each run
            logging: false,
          };
        }

        // 🐬 MySQL for dev/prod
        return {
          type: 'mysql' as const,
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT || 3306),
          username: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME,
          autoLoadEntities: true,
          synchronize: true,     
          logging: false,
        };
      },
    }),
    UsersModule,
    ListingModule, 
    AuthModule
  ],
  controllers: [AppController],
})
export class AppModule {}
