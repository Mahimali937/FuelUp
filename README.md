# FuelUp

> A modern food inventory system designed for universities — built with Next.js, TypeScript, Express, and PostgreSQL.

**FuelUp** is a real-time food inventory and management system built for Hunter College, streamlining campus food access and ensuring efficient stock control. It provides an intuitive interface for both staff and students to manage, withdraw, and track food items with precision.

**🚀 Used by 500+ campus users, managing 20+ high-demand essential items weekly**

---

## 🌐 Visit The Site

Feel free to check out the [project here!](https://fuelup.vercel.app/)

<img width="1433" alt="Screenshot 2025-06-07 at 1 43 52 PM" src="https://github.com/user-attachments/assets/7486d1fe-8849-4f0b-aa8f-f705461b9d7d" />

---

## 🔑 Key Features

📦 **Inventory Management**  
Staff can add, update, and track food stock accurately.

🔐 **Role-Based Access**  
Staff: Full inventory control  
Students: Withdraw items and update quantities independently

📊 **Demand Tracking**  
Monitor item popularity and usage trends to improve restocking decisions.

🧾 **Itemized Logging**  
Every transaction is recorded at the item level for better transparency and analytics.

---

## 📁 Tech Stack

- **Frontend**: Next.js, TypeScript
- **Backend**: Express.js
- **Database**: PostgreSQL
- **Deployment**: Vercel

---

## ✅ Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js v18+**
- **PostgreSQL**
- _(Optional but recommended)_ **Prisma CLI**  
  Install with: `npm install -g prisma`
- _(Optional)_ **Vercel CLI** and/or **Railway CLI** for local deployment

---

## 🔌 API Endpoints

Here are a few core API routes used by FuelUp:

- `GET /api/items`  
  Fetch all inventory items with quantities and categories.

- `POST /api/items`  
  Add a new item (admin only).

- `PATCH /api/items/:id/withdraw`  
  Withdraw quantity from an existing item (used by students).

---

## 🛠️ Installation

```bash
# 1. Clone and enter the project
git clone https://github.com/mahimali937/FuelUp.git
cd FuelUp

# 2. Backend setup
cd backend
npm install
cp .env.example .env       # ← Fill in your PostgreSQL credentials
npx prisma migrate dev     # ← Applies schema to DB
npm run dev

# 3. Frontend setup
cd ../frontend
npm install

# 4. Start the frontend
npm run dev
```
