import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const email = profile.emails && profile.emails[0].value;
    const name = profile.displayName;
    const providerId = profile.id;

    if (!email.endsWith('@mun.ca')) {
      // Only allow MUN emails
      return done(new Error('Only MUN emails allowed'), false);
    }

    const user = {
      email,
      name,
      provider: 'google',
      providerId,
    };

    done(null, user); 
  }
}
