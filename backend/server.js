import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/auth.routes.js';
import planRoutes from './src/routes/plan.routes.js';
import subscriptionRoutes from './src/routes/subscription.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import couponRoutes from './src/routes/coupon.routes.js';
import userRoutes from './src/routes/user.routes.js';
import webhookRoutes from './src/routes/webhook.routes.js';
import { errorHandler } from './src/middleware/error.middleware.js';
import { seedAccounts } from './src/utils/seeder.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Webhook route must be before express.json() middleware (handles raw body)
app.use('/api/webhooks', webhookRoutes);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler (must be last)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-subscription')
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    await seedAccounts();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;
