#!/usr/bin/env node

/**
 * Email Setup Script for MUN Marketplace
 * This script helps you configure email sending for OTP verification
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('MUN Marketplace Email Setup');
console.log('============================\n');

console.log('This script will help you configure email sending for OTP verification.\n');

console.log('Prerequisites:');
console.log('1. A Gmail account');
console.log('2. 2-Factor Authentication enabled on your Google Account');
console.log('3. An App Password generated for this application\n');

console.log('To generate an App Password:');
console.log('1. Go to your Google Account settings');
console.log('2. Navigate to Security > 2-Step Verification');
console.log('3. Scroll down to "App passwords"');
console.log('4. Select "Mail" and "Other" device');
console.log('5. Name it "MUN Marketplace"');
console.log('6. Copy the 16-character password\n');

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function setupEmail() {
  try {
    const gmailUser = await askQuestion('Enter your Gmail address: ');
    const gmailPass = await askQuestion('Enter your 16-character App Password: ');

    if (!gmailUser || !gmailPass) {
      console.log('Error: Both Gmail address and App Password are required.');
      process.exit(1);
    }

    if (!gmailUser.includes('@gmail.com')) {
      console.log('Warning: This script is configured for Gmail. Other providers may need different configuration.');
    }

    if (gmailPass.length !== 16) {
      console.log('Warning: App Password should be 16 characters long.');
    }

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

    // Write .env file
    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);

    console.log('\nEmail configuration saved to .env file');
    console.log('\nNext steps:');
    console.log('1. Restart your backend server: npm run start:dev');
    console.log('2. Test registration with a real email address');
    console.log('3. Check your email inbox for the OTP code');
    console.log('\nEmail sending is now configured!');

  } catch (error) {
    console.error('Error setting up email:', error.message);
  } finally {
    rl.close();
  }
}

setupEmail();
