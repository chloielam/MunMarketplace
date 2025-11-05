import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpCode } from './otp.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailerService } from '../common/mailer.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { Session } from './entities/session.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([OtpCode, Session]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, MailerService],
  exports: [AuthService],
})
export class AuthModule {}
