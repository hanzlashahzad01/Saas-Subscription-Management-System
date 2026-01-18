import express from 'express';
import { createCheckoutSession, getPayments, getPayment, approvePayment, verifyCard } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-checkout', protect, createCheckoutSession);
router.post('/verify-card', protect, verifyCard);
router.get('/', protect, getPayments);
router.get('/:id', protect, getPayment);
router.post('/:id/approve', protect, approvePayment);

export default router;
