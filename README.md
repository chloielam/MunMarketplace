# MUN Marketplace

A web application for Memorial University students and staff to **buy, sell, and trade items** in a safe and friendly environment — similar to Facebook Marketplace but exclusive to the MUN community.  

---

## 👥 Group Members
- Rumnaz  
- Gia  
- Aditi  
- Moaaz  
- Archak  
- Tarik  
- Kriti  

---

## 📖 Introduction
MUN Marketplace aims to provide a **secure and user-friendly platform** for MUN students and staff.  
Users can buy and sell items such as housing, old clothes, lecture notes, and other used goods.  
The platform will ensure trust by requiring authentication with a valid MUN email address.  

---

## 🚀 Core Functionalities
1. **Authentication** — Log in securely using MUN email credentials.  
2. **Homepage listings** — Browse all available items, with filtering by price, category, and location.  
3. **Profiles** — Buyers and sellers have profiles with personal information, purchase history, and selling history.  
4. **Item posting** — Sellers can add items with details like price, photos, and descriptions.  
5. **Ratings & reviews** — Buyers can leave reviews for sellers after successful transactions.  
6. **Cart & checkout** — Buyers can add items to a cart and check out selected items.  
7. **Real-time chat** — Secure messaging system between buyers and sellers for negotiations and inquiries.  

---


## 🛠️ Tech Stack
- **Frontend:** React (Vite + TypeScript)  
- **Backend:** NestJS (Node.js, TypeScript)  
- **Database:** MySQL  
- **Containerization:** Docker & Docker Compose  
- **Authentication:** MUN email (OAuth/SSO integration)  
- **Other Tools:** phpMyAdmin, GitHub Projects (for task tracking)  

---

## 📂 Repository Structure
```plaintext
mun-marketplace/
│
├── frontend/        # React application (UI)
├── backend/         # NestJS application (API, auth, chat, etc.)
├── docker-compose.yml
├── README.md
└── .gitignore

---

## ⚡ Quickstart (Local Setup)
# Start database
docker-compose up -d db

# Start backend
cd backend
npm install
npm run start:dev

# Start frontend
cd ../frontend
npm install
npm run dev

---

## 🗂️ Module / Package Map
frontend/              — All UI components, pages, and state management  
backend/               — API controllers, services, authentication, chat  
backend/src/modules/   — Feature modules (users, items, transactions)  

---

## 🖼️ Architecture Diagram
│
├──docs/diagrams


---


