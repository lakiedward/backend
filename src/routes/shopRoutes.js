import express from 'express';
import {
  getAllShops,
  getShopById,
  getShopsByUser,
  getMyShops,
  createShop,
  updateShop,
  deleteShop
} from '../controllers/shopController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require authentication) - trebuie să fie primele pentru a evita conflictul cu /:id
router.get('/my/all', authenticateToken, getMyShops);
router.post('/', authenticateToken, createShop);
router.put('/:id', authenticateToken, updateShop);
router.delete('/:id', authenticateToken, deleteShop);

// Public routes
router.get('/', getAllShops);
router.get('/user/:userId', getShopsByUser);
router.get('/:id', getShopById);

export default router;
