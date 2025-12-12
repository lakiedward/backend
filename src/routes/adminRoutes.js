import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllShopsAdmin,
  updateShopAdmin,
  deleteShopAdmin,
  getAllProducersAdmin,
  updateProducerAdmin,
  deleteProducerAdmin,
  getAllProductsAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  getDashboardStats
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require admin role
router.use(authenticateToken, isAdmin);

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Shops
router.get('/shops', getAllShopsAdmin);
router.put('/shops/:id', updateShopAdmin);
router.delete('/shops/:id', deleteShopAdmin);

// Producers
router.get('/producers', getAllProducersAdmin);
router.put('/producers/:id', updateProducerAdmin);
router.delete('/producers/:id', deleteProducerAdmin);

// Products
router.get('/products', getAllProductsAdmin);
router.put('/products/:id', updateProductAdmin);
router.delete('/products/:id', deleteProductAdmin);

export default router;
