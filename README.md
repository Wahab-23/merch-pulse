# ⚡ MerchPulse — Merchandiser Performance Platform

**MerchPulse** is a modern, real-time performance tracking and communication platform designed for retail and e-commerce merchandising teams. It enables managers to set goals, track achievements, and maintain close contact with field merchandisers through an integrated chat system.

---

## 🚀 Features

### 👤 Role-Based Portals
*   **Admin Dashboard:**
    *   Monitor the performance of all merchandisers.
    *   Compare performance metrics against monthly targets.
    *   Create, view, and manage user accounts and system roles.
*   **Merchandiser Portal:**
    *   Submit daily task records.
    *   Visualize personal progress using dynamic charts.
    *   Track weekly and monthly goals in real time.

### 📊 KPI & Task Metrics
Merchandisers log their daily tasks, which are automatically translated into **Equivalent Uploads** using a weighted formula:
*   **Product Uploads:** 1.0x weight
*   **Re-Optimizations:** 0.33x weight (divided by 3)
*   **Price Updates:** 0.14x weight (divided by 7)
*   **Price Comparisons:** 0.20x weight (divided by 5)
*   **Stock Updates:** 0.10x weight (divided by 10)
*   **CSV Updates:** 10.0x weight (counts as 10 uploads)

### 💬 Real-Time Messenger
*   Direct user-to-user messaging built with **Pusher**.
*   Supports emoji reaction pickers.
*   Enables attachments and file uploads for reports, CSVs, or receipts.
*   Real-time browser notifications for unread messages.

---

## 🛠️ Tech Stack

*   **Frontend:** [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
*   **Database & ORM:** MariaDB / MySQL via [Prisma ORM](https://www.prisma.io/)
*   **Charts & Visualization:** [Recharts](https://recharts.org/)
*   **Real-time Synced Communications:** [Pusher Channels](https://pusher.com/)
*   **Security & Auth:** JSON Web Tokens (JWT), `bcryptjs`, Cookie-based middleware protection
*   **UI Components:** Radix UI primitives, Lucide Icons, and `sonner` toasts

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory and define the following variables:

```env
# JWT Security
JWT_SECRET="your-jwt-secret-key"

# Database Connection (MariaDB/MySQL)
DATABASE_URL="mysql://username:password@localhost:3306/merchpulsedb"

# Pusher Channels Config
PUSHER_APP_ID="your-pusher-app-id"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
```

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database Schema
Generate the Prisma client and push your schema to MariaDB/MySQL:
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Default Admin User
Generate default roles and create the master administrator account (`admin@example.com` / `Admin123`):
```bash
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📁 Project Directory Structure

```text
├── app/
│   ├── (dashboard)/       # Role-protected dashboard routes (Admin / Merchandiser)
│   ├── api/               # API endpoints (Auth, Messages, KPI Records, Uploads)
│   ├── generated/         # Prisma Client output target
│   ├── globals.css        # Main stylesheet
│   └── page.tsx           # Landing marketing page
├── components/            # Shared UI components (app-sidebar, chat-interface, etc.)
├── hooks/                 # Custom React hooks
├── lib/                   # Utility helpers (Prisma client, Auth wrappers, Pusher configuration)
├── prisma/                # Database schema definition and seed scripts
└── public/                # Static assets and branding logos
```
