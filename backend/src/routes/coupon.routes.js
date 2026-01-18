import express from 'express';
import {
  getCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon
} from '../controllers/coupon.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, authorize('super_admin', 'company_admin'), getCoupons);
router.get('/validate/:code', validateCoupon);
router.post('/', protect, authorize('super_admin', 'company_admin'), createCoupon);
router.put('/:id', protect, authorize('super_admin', 'company_admin'), updateCoupon);
router.delete('/:id', protect, authorize('super_admin', 'company_admin'), deleteCoupon);
router.post('/:code/apply', protect, applyCoupon);

export default router;
