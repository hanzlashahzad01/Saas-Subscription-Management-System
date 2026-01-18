import express from 'express';
import { getRevenueAnalytics, getSubscriptionAnalytics } from '../controllers/analytics.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/revenue', protect, authorize('super_admin', 'company_admin'), getRevenueAnalytics);
router.get('/subscriptions', protect, authorize('super_admin', 'company_admin'), getSubscriptionAnalytics);

export default router;
