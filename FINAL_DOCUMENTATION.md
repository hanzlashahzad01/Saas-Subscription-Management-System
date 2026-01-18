# SaaS Subscription Management System - Documentation

Welcome to the **SaaS Subscription Management System**, a professional and highly secure platform built for businesses to handle subscriptions, payments, and user management efficiently.

## 🚀 Live Credentials (Pre-seeded)

Use these fixed accounts for testing after starting the server:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@admin.com` | `admin123` |
| **Manager** | `manager@manager.com` | `manager123` |

*Note: All new registrations via Signup page are automatically set to **Customer** role for security.*

## ✨ Core Features

### 1. Advanced User Management (Admin Only)
- Admins can view all registered users.
- Edit user details (Name, Email, Role).
- Update/Reset any user's password.
- Toggle account status (Active/Inactive) or Delete users.

### 2. Multi-tier Subscription System
- Monthly & Yearly billing cycles.
- Dynamic pricing based on selected plan.
- **Save 20%** highlighted for yearly plans.
- Coupon code support (Validation for min amount, expiry, and usage limits).

### 3. Secure Payment Gateway (Simulation)
- **Credit/Debit Card**: Secure information verify modal before processing.
- **Manual Payments**: JazzCash, EasyPaisa, and Bank Transfer support.
- Admin approval flow for manual/card pending payments.
- Real-time notifications for payment status updates.

### 4. Professional UI/UX
- Stunning dark mode and glassmorphism elements.
- Fully responsive design using Tailwind CSS.
- Smooth animations and micro-interactions.

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Recharts (for Analytics).
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Auth**: JWT (Refresh/Access Tokens) & Bcrypt password hashing.
- **Payments**: Stripe API integration (Real) + Manual flow.

## ⚙️ Setup Instructions

### Backend
1. Go to `backend` folder.
2. Install dependencies: `npm install`
3. Start the server: `npm run dev`
4. The system will automatically seed the Admin and Manager accounts on first start.

### Frontend
1. Go to `frontend` folder.
2. Install dependencies: `npm install`
3. Start the app: `npm run dev`

---
*Created by Antigravity AI Assistant*
