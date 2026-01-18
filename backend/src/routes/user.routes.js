import express from 'express';
import { updateProfile, updatePassword, uploadAvatar, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/avatar', protect, uploadAvatar);

// Admin routes
router.get('/', protect, authorize('super_admin'), getAllUsers);
router.get('/:id', protect, authorize('super_admin'), getUserById);
router.put('/:id', protect, authorize('super_admin'), updateUser);
router.delete('/:id', protect, authorize('super_admin'), deleteUser);

export default router;
