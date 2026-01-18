import express from 'express';
import { getPlans, getPlan, createPlan, updatePlan, deletePlan } from '../controllers/plan.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getPlans);
router.get('/:id', getPlan);
router.post('/', protect, authorize('super_admin', 'company_admin'), createPlan);
router.put('/:id', protect, authorize('super_admin', 'company_admin'), updatePlan);
router.delete('/:id', protect, authorize('super_admin', 'company_admin'), deletePlan);

export default router;
