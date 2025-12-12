import express from 'express';
import {
  getProductsByShop,
  getProductById,
  createProduct,
  createProducts,
  updateProduct,
  deleteProduct,
  syncProducts
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/shop/:shopId', getProductsByShop);
router.get('/:id', getProductById);

// Protected routes (require authentication)
router.post('/shop/:shopId', authenticateToken, createProduct);
router.post('/shop/:shopId/bulk', authenticateToken, createProducts);
router.put('/shop/:shopId/sync', authenticateToken, syncProducts);
router.put('/:id', authenticateToken, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

export default router;
