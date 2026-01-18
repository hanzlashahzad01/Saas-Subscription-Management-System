import express from 'express';
import { 
  getSubscriptions, 
  getSubscription, 
  createSubscription,
  cancelSubscription,
  upgradeSubscription 
} from '../controllers/subscription.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getSubscriptions);
router.get('/:id', protect, getSubscription);
router.post('/', protect, createSubscription);
router.post('/:id/cancel', protect, cancelSubscription);
router.post('/:id/upgrade', protect, upgradeSubscription);

export default router;
