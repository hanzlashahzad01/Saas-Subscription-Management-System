# SaaS Subscription Management System

A complete, production-ready SaaS subscription management platform built with MERN stack, featuring Stripe payment integration, webhooks, analytics, and role-based access control.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based authentication with role-based access control
- **Pricing Plans Management**: Create, edit, and manage subscription plans
- **Subscription Management**: Subscribe, upgrade, downgrade, and cancel subscriptions
- **Payment Processing**: Secure Stripe integration for card payments
- **Webhooks**: Real-time payment event handling
- **Analytics Dashboard**: Revenue tracking, subscription metrics, and growth charts
- **Multi-role System**: Super Admin, Company Admin, and Customer roles

### Advanced Features
- Trial period support (7-14 days)
- Auto-renewal subscriptions
- Billing history and invoices
- Usage tracking
- Notification system
- Responsive mobile design

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS**
- **React Router v6**
- **Axios**
- **React Hook Form + Zod**
- **Recharts**

### Backend
- **Node.js**
- **Express.js**
- **JWT Authentication**
- **Stripe API**
- **MongoDB + Mongoose**

## 📁 Project Structure

```
SaaS Subscription Management System/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── webhooks/
│   ├── package.json
│   └── server.js
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Stripe account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. Start the development server:
```bash
npm run dev
```

## 🧪 Stripe Test Cards

For testing payments, use these Stripe test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

**Test Details:**
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any ZIP code (US) or postal code

## 🔐 User Roles

### Super Admin
- Full platform access
- Manage all companies
- System-wide analytics

### Company Admin
- Create and manage plans
- View company analytics
- Manage subscriptions

### Customer
- Subscribe to plans
- Manage own subscription
- View billing history

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Plans
- `GET /api/plans` - Get all plans
- `POST /api/plans` - Create plan (Admin)
- `PUT /api/plans/:id` - Update plan (Admin)
- `DELETE /api/plans/:id` - Delete plan (Admin)

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions/:id/cancel` - Cancel subscription
- `POST /api/subscriptions/:id/upgrade` - Upgrade subscription

### Payments
- `POST /api/payments/create-checkout` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Stripe webhook endpoint

### Analytics
- `GET /api/analytics/revenue` - Get revenue analytics (Admin)
- `GET /api/analytics/subscriptions` - Get subscription metrics (Admin)

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Backend (Render/Railway)
1. Push code to GitHub
2. Create new service on Render/Railway
3. Add environment variables
4. Set build command: `npm install`
5. Set start command: `npm start`

### Webhook Configuration
- Set Stripe webhook URL: `https://your-backend-url.com/api/webhooks/stripe`
- Select events: `checkout.session.completed`, `customer.subscription.updated`, `invoice.payment_succeeded`

## 📸 Screenshots

## Sign up page

<img width="1917" height="1027" alt="sign up " src="https://github.com/user-attachments/assets/84ed8067-2110-48f3-8233-655dea742373" />

## Sign in page

<img width="1919" height="1032" alt="sign in" src="https://github.com/user-attachments/assets/38b3373e-d3f0-4cf0-9b25-9ab831981cc1" />

### Admin DashBoard

<img width="1919" height="1032" alt="admin dashboard" src="https://github.com/user-attachments/assets/656c8577-d054-4d98-8b36-9a6fd2a0b363" />

<img width="1919" height="1031" alt="dashboard1" src="https://github.com/user-attachments/assets/1947e57a-d669-4485-8f54-99ff8648a8ad" />

<img width="1919" height="1030" alt="dashboard2" src="https://github.com/user-attachments/assets/805191af-388f-447b-a119-5996e12ac91d" />

## Plan Management Page

<img width="1919" height="1034" alt="plan" src="https://github.com/user-attachments/assets/e509a8c1-4900-48b3-9488-6104a276b055" />

## Payment Management Page

<img width="1919" height="1032" alt="payment management page" src="https://github.com/user-attachments/assets/3d960444-d20d-47d3-af57-66a6c493328f" />

## Coupons Page

<img width="1919" height="1030" alt="coupon" src="https://github.com/user-attachments/assets/280cd05b-aa61-4b04-9d0f-2971f8345000" />

<img width="1919" height="1032" alt="copmon1" src="https://github.com/user-attachments/assets/fb3418ed-19c6-4ea9-9ef9-97ed0a3de406" />

## User Management Page

<img width="1919" height="1034" alt="user management" src="https://github.com/user-attachments/assets/d26b3f7b-795d-478c-84ca-acef2b4c769f" />

## Pricing Management Page

<img width="1919" height="1030" alt="pricing" src="https://github.com/user-attachments/assets/b8f068ae-914e-45da-82a3-09a37c3c2a36" />

<img width="1919" height="1033" alt="p1" src="https://github.com/user-attachments/assets/af65f342-4303-4e28-a277-7c5a7b9bc435" />

<img width="1919" height="1029" alt="p2" src="https://github.com/user-attachments/assets/e6198d71-bdeb-4d17-913a-7cbe5f35d157" />

<img width="1919" height="1033" alt="p3" src="https://github.com/user-attachments/assets/4dc48cd5-f687-4176-92fb-055d3ae9c217" />

## My Subscription Page

<img width="1919" height="1027" alt="my subscription" src="https://github.com/user-attachments/assets/9be1754d-931a-4bd7-afc8-c022d93a2a90" />

## Billing History Page

<img width="1919" height="1033" alt="billing histoty" src="https://github.com/user-attachments/assets/70de74b9-8657-401c-8b6b-2578fff0a1c2" />

## Settings Page

<img width="1919" height="1030" alt="settings" src="https://github.com/user-attachments/assets/24f1306b-fe78-4453-8a63-7a67047c942f" />

## User DashBoard Page

<img width="1919" height="1030" alt="uswer dashboard" src="https://github.com/user-attachments/assets/5352d947-bdd3-4000-b0a9-277b526795aa" />

## User Subscription Page

<img width="1919" height="1030" alt="user subscription" src="https://github.com/user-attachments/assets/1664efb3-0e94-4926-9d87-174a117a9c0a" />

## User Billing Page

<img width="1919" height="1030" alt="user billing" src="https://github.com/user-attachments/assets/95d62058-b3b8-4458-8ed9-17d430f33250" />

## User Pricing Page

<img width="1917" height="1033" alt="user p" src="https://github.com/user-attachments/assets/35af7999-bf9a-4933-836f-d178f15919b9" />

<img width="1919" height="1029" alt="user p2" src="https://github.com/user-attachments/assets/7b2c3541-76d5-4199-86d3-d38a870942c3" />

## Real Time Notifications

<img width="1919" height="1031" alt="u notifications" src="https://github.com/user-attachments/assets/a9b07ea1-04a4-4dba-82a5-52a4c51eae48" />

## User Settings Page

<img width="1919" height="1031" alt="user setting" src="https://github.com/user-attachments/assets/9fcb44d4-72bd-44fb-8898-051560de8611" />


## 📝 License

MIT License

## 👨‍💻 Author

Built with ❤️ for the international SaaS market

---

**Note**: This is a production-ready SaaS subscription management system with advanced features. Make sure to configure all environment variables and Stripe keys before deployment.
