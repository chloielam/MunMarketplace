#!/usr/bin/env node

/**
 * Email Test Script for MUN Marketplace
 * This script tests if email configuration is working correctly
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing Email Configuration...\n');

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;

  if (!gmailUser || !gmailPass) {
    console.log('Email configuration not found!');
    console.log('Please run: node setup-email.js');
    process.exit(1);
  }

  console.log(`Gmail User: ${gmailUser}`);
  console.log(`App Password: ${'*'.repeat(gmailPass.length)}`);
  console.log('');

  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // Test connection
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection successful!');

    // Send test email
    console.log('Sending test email...');
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await transporter.sendMail({
      from: `"MUN Marketplace" <${gmailUser}>`,
      to: gmailUser, // Send to yourself for testing
      subject: 'MUN Marketplace — Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #d32f2f;">MUN Marketplace Email Test</h1>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
            <h2 style="color: #d32f2f; font-size: 24px; margin: 0;">Test Code: ${testCode}</h2>
          </div>
          <p>If you received this email, your email configuration is working correctly! 🎉</p>
          <hr>
          <p style="color: #666; font-size: 14px;">
            This is an automated test email from MUN Marketplace
          </p>
        </div>
      `,
      text: `
MUN Marketplace Email Test

This is a test email to verify your email configuration is working correctly.

Test Code: ${testCode}

If you received this email, your email configuration is working correctly! 🎉

---
This is an automated test email from MUN Marketplace
      `
    });

    console.log('Test email sent successfully!');
    console.log(`Check your inbox at ${gmailUser}`);
    console.log(`Test code: ${testCode}`);

  } catch (error) {
    console.error('Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\nTroubleshooting:');
      console.log('1. Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('2. Ensure 2-Factor Authentication is enabled on your Google Account');
      console.log('3. Verify the App Password was generated correctly');
    } else if (error.message.includes('Less secure app access')) {
      console.log('\nTroubleshooting:');
      console.log('1. Use App Passwords instead of enabling less secure apps');
      console.log('2. App Passwords are more secure and recommended');
    }
  }
}

testEmail();
