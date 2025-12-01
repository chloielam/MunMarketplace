import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '../mailer.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailerService', () => {
  let service: MailerService;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    mockSendMail = jest.fn().mockResolvedValue({});
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: mockSendMail });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              switch (key) {
                case 'GMAIL_USER': return 'test@gmail.com';
                case 'GMAIL_PASS': return 'password';
                case 'OTP_TTL_MINUTES': return 10;
                default: return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it('should send email with correct parameters', async () => {
    const email = 'user@test.com';
    const code = '123456';

    await service.sendOtp(email, code);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        subject: expect.stringContaining('Email Verification Code'),
        text: expect.stringContaining(code),
        html: expect.stringContaining(code),
      }),
    );
  });

  it('should fallback to console.log if config is missing', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const faultyModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: ConfigService,
          useValue: { get: () => null }, // No config
        },
      ],
    }).compile();
    const faultyService = faultyModule.get(MailerService);
    await faultyService.sendOtp('user@test.com', '999999');

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('OTP for user@test.com'));
    consoleSpy.mockRestore();
  });

  it('should log error if sendMail throws', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await service.sendOtp('user@test.com', '888888');

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Email sending failed'), expect.any(String));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('OTP for user@test.com'));

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
});
