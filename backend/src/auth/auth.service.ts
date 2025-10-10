import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateAndGetJwt(email: string, name: string, provider: string, providerId: string) {
    if (!email.endsWith('@mun.ca')) {
      throw new UnauthorizedException('Only MUN emails allowed');
    }

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.createFromOAuth(email, name, provider, providerId);
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { user, token };
  }
}
