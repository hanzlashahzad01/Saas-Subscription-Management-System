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

_(Add screenshots of your application here after deployment)_

## 📝 License

MIT License

## 👨‍💻 Author

Built with ❤️ for the international SaaS market

---

**Note**: This is a production-ready SaaS subscription management system with advanced features. Make sure to configure all environment variables and Stripe keys before deployment.
