import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp-dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotDto } from './dto/forgot.dto';
import { ResetDto } from './dto/reset.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SessionUserId } from './session-user.decorator';
import type { Request, Response } from 'express';
import type { SessionData } from 'express-session';

interface ExtendedSessionData extends SessionData {
  userId?: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private auth: AuthService) {}

  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) { return this.auth.sendOtp(dto.email); }

  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) { return this.auth.verifyOtp(dto.email, dto.code); }

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.register(dto.email, dto.fullName, dto.password); }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const result = await this.auth.login(dto.email, dto.password);
    if (!result.user?.id) throw new InternalServerErrorException('Invalid user data');
    await this.startSession(req, result.user.id);
    return result;
  }

  @Get('session')
  async getSession(@Req() req: Request) {
    const session = req.session as ExtendedSessionData | undefined;
    const sessionUserId = session?.userId;
    if (!sessionUserId) throw new UnauthorizedException('Not authenticated');
    const user = await this.auth.getSessionUser(sessionUserId);
    if (!user) throw new UnauthorizedException('Not authenticated');
    return { user };
  }

  @Post('forgot-password')
  forgot(@Body() dto: ForgotDto) { return this.auth.forgotPassword(dto.email); }

  @Post('verify-password-reset-otp')
  verifyPasswordResetOtp(@Body() dto: VerifyOtpDto) { return this.auth.verifyPasswordResetOtp(dto.email, dto.code); }

  @Post('reset-password')
  reset(@Body() dto: ResetDto) { return this.auth.resetPassword(dto.email, dto.code, dto.newPassword); }

  @Post('change-password')
  changePassword(
    @SessionUserId() userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.auth.changePassword(userId, dto.currentPassword, dto.newPassword);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'mun.sid';
    await new Promise<void>((resolve, reject) => {
      req.session.destroy(err => {
        if (err) return reject(err);
        const sameSite = (process.env.SESSION_SAME_SITE as 'lax' | 'strict' | 'none' | undefined) ??
          (process.env.NODE_ENV === 'production' ? 'none' : 'lax');
        res.clearCookie(cookieName, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite,
        });
        resolve();
      });
    }).catch(() => { throw new InternalServerErrorException('Failed to log out'); });
  }

  private async startSession(req: Request, userId: string) {
    if (!req.session) {
      throw new InternalServerErrorException('Session middleware not initialized');
    }
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate(err => {
        if (err) return reject(err);
        const session = req.session as ExtendedSessionData;
        session.userId = userId;
        resolve();
      });
    }).catch(err => {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to create session: ${message}`, err instanceof Error ? err.stack : undefined);
      throw new InternalServerErrorException('Failed to create session');
    });
  }
}
