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
docker compose up -d     # rebuild and start fresh
```

Create a `.env` file in `backend/`:
```env
DATABASE_URL="mysql://mun_user:mun_pass@localhost:3306/mun_marketplace"
PORT=3000
```

3. **Run the backend in dev mode**
```bash
npm run start:dev
```

Backend runs at: http://localhost:3000

---

## 🔌 API Endpoints

- `GET /health` → returns `{ ok: true }`
- More endpoints coming soon…