# MUN Marketplace - Backend

## 🚀 Tech Stack
- NestJS (Node.js, TypeScript)
- TypeORM
- MySQL
- Docker (for local DB)

## ⚙️ Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**

For Apple Silicone Macbook, in the docker-compose.yml add: 
```docker-compose.yml
phpmyadmin:
  image: phpmyadmin/phpmyadmin
  platform: linux/arm64/v8
```

To run docker: 
```bash
docker compose down -v   # stop + remove containers and volumes
docker compose up -d     # rebuild and start fresh (may choose this for first setup)
```

Create a `.env` file in `backend/`:
```env
# Database Configuration
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
JWT_SECRET=secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=1h

# OTP Configuration
OTP_TTL_MINUTES=10
MAX_OTPS_PER_HOUR=10

# Email Configuration
GMAIL_USER=marketplacemun@gmail.com
GMAIL_PASS=fyef xikg beor jrja
```

**Quick Setup**: Run the automatic email configuration:
```bash
node auto-setup-email.js
```

3. **Run seed for example data**
```bash
npm run seed
```


5. **Run the backend in dev mode**
```bash
npm run start:dev
```

Backend runs at: http://localhost:3000

---

## 🔌 API Endpoints

- `GET /health` → returns `{ ok: true }`
- `GET /api/listings` -> return list of listings