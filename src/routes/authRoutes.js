import express from 'express';
import { registerUser, registerProducer, loginUser, getProfile, updateUser, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/register/producer', registerProducer);
router.post('/login', loginUser);
router.get('/me', authenticateToken, getProfile);
router.get('/profile', authenticateToken, getProfile);
router.put('/users/:id', authenticateToken, updateUser);
router.put('/users/password/change', authenticateToken, changePassword);

export default router;
