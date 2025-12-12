import express from 'express';
import { updateUser, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.put('/password/change', authenticateToken, changePassword);
router.put('/:id', authenticateToken, updateUser);

export default router;
