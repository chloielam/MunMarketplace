import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

type NodemailerModule = {
  createTransport: (options: {
    service: string;
    auth: { user: string; pass: string };
  }) => unknown;
};

type TransporterLike = {
  sendMail: (mail: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<unknown>;
};

const isNodemailerModule = (value: unknown): value is NodemailerModule =>
  typeof value === 'object' &&
  value !== null &&
  'createTransport' in value &&
  typeof (value as { createTransport: unknown }).createTransport === 'function';

const isTransporterLike = (value: unknown): value is TransporterLike =>
  typeof value === 'object' &&
  value !== null &&
  'sendMail' in value &&
  typeof (value as { sendMail: unknown }).sendMail === 'function';

@Injectable()
export class MailerService {
  private readonly transporter: TransporterLike | null;

  constructor(private config: ConfigService) {
    const gmailUser = this.config.get<string>('GMAIL_USER');
    const gmailPass = this.config.get<string>('GMAIL_PASS');
    const nodemailerModule: unknown = nodemailer;

    if (gmailUser && gmailPass && isNodemailerModule(nodemailerModule)) {
      const candidate = nodemailerModule.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });
      this.transporter = isTransporterLike(candidate) ? candidate : null;
      return;
    }

    this.transporter = null;
  }

  async sendOtp(email: string, code: string) {
    const gmailUser = this.config.get<string>('GMAIL_USER');
    const gmailPass = this.config.get<string>('GMAIL_PASS');
    const otpTtl =
      this.config.get<string>('OTP_TTL_MINUTES') ??
      String(this.config.get<number>('OTP_TTL_MINUTES') ?? 10);

    if (!gmailUser || !gmailPass || !isTransporterLike(this.transporter)) {
      // For development: log OTP to console instead of sending email
      console.log(`\nOTP for ${email}: ${code}\n`);
      console.log(
        'To enable real email sending, configure GMAIL_USER and GMAIL_PASS in .env file',
      );
      return;
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MUN Marketplace Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">MUN Marketplace</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Memorial University Student Marketplace</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #d32f2f; margin-top: 0;">Email Verification Code</h2>
          
          <p>Hello!</p>
          <p>You're registering for the MUN Marketplace. Please use the verification code below to complete your registration:</p>
          
          <div style="background-color: #fff; border: 2px solid #d32f2f; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #d32f2f; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: monospace;">${code}</h1>
          </div>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>This code expires in ${otpTtl} minutes</li>
            <li>Only use this code for MUN Marketplace registration</li>
            <li>Do not share this code with anyone</li>
          </ul>
          
          <p>If you didn't request this verification code, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #666; text-align: center;">
            This email was sent by MUN Marketplace<br>
            Memorial University of Newfoundland
          </p>
        </div>
      </body>
      </html>
    `;

    const textTemplate = `
MUN Marketplace - Email Verification

Hello!

You're registering for the MUN Marketplace. Please use the verification code below to complete your registration:

Verification Code: ${code}

Important:
- This code expires in ${otpTtl} minutes
- Only use this code for MUN Marketplace registration  
- Do not share this code with anyone

If you didn't request this verification code, please ignore this email.

---
This email was sent by MUN Marketplace
Memorial University of Newfoundland
    `;

    try {
      await this.transporter.sendMail({
        from: `"MUN Marketplace" <${gmailUser}>`,
        to: email,
        subject: 'MUN Marketplace — Email Verification Code',
        text: textTemplate,
        html: htmlTemplate,
      });
      console.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Email sending failed:', error.message);
      } else {
        console.error('Email sending failed:', error);
      }
      // Fallback to console logging if email fails
      console.log(`\nOTP for ${email}: ${code}\n`);
      console.log('Email sending failed, OTP logged to console');
    }
  }
}
