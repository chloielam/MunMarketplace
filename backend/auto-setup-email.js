#!/usr/bin/env node

/**
 * Automatic Email Setup Script for MUN Marketplace
 * This script automatically configures email sending with predefined credentials
 */

const fs = require('fs');
const path = require('path');

console.log('MUN Marketplace Automatic Email Setup');
console.log('=====================================\n');

console.log('Configuring email settings with predefined credentials...\n');

// Predefined email credentials
const gmailUser = 'marketplacemun@gmail.com';
const gmailPass = 'fyef xikg beor jrja';

// Create .env content
const envContent = `# Database Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=mun_user
DB_PASS=mun_pass
DB_NAME=mun_marketplace

# App Configuration
PORT=3000
GLOBAL_PREFIX=api

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=1h

# OTP Configuration
OTP_TTL_MINUTES=10
MAX_OTPS_PER_HOUR=5

# Email Configuration
GMAIL_USER=${gmailUser}
GMAIL_PASS=${gmailPass}
`;

try {
  // Write .env file
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);

  console.log('Email configuration saved to .env file');
  console.log(`Gmail User: ${gmailUser}`);
  console.log(`App Password: ${'*'.repeat(gmailPass.length)}`);
  console.log('\nNext steps:');
  console.log('1. Restart your backend server: npm run start:dev');
  console.log('2. Test registration with a real email address');
  console.log('3. Check your email inbox for the OTP code');
  console.log('\nEmail sending is now configured!');

} catch (error) {
  console.error('Error setting up email:', error.message);
  process.exit(1);
}
