import { Controller, Post, Body } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: { email: string }) {
    const { email } = body;

    // Hardcoded check for MUN emails
    if (email && email.endsWith('@mun.ca')) {
      return { message: 'Login successful', email };
    } else {
      return { message: 'Invalid MUN email address' };
    }
  }
}
