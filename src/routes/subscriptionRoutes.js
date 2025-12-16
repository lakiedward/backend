import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getShopSubscriptionConfig,
  upsertShopSubscriptionConfig,
  deleteShopSubscriptionConfig,
  subscribeToShop,
  getUserSubscriptions,
  getShopSubscribers,
  updateSubscriptionStatus,
  cancelSubscription
} from '../controllers/subscriptionController.js';

const router = express.Router();

// ============================================
// SHOP SUBSCRIPTION CONFIG (for producers)
// ============================================

// GET shop subscription config (public)
router.get('/shop/:shopId/config', getShopSubscriptionConfig);

// POST/PUT shop subscription config (producer only)
router.post('/shop/:shopId/config', authenticateToken, upsertShopSubscriptionConfig);

// DELETE shop subscription config (producer only)
router.delete('/shop/:shopId/config', authenticateToken, deleteShopSubscriptionConfig);

// ============================================
// USER SUBSCRIPTIONS (for customers)
// ============================================

// POST subscribe to a shop
router.post('/', authenticateToken, subscribeToShop);

// GET user's subscriptions
router.get('/user', authenticateToken, getUserSubscriptions);

// GET shop's subscribers (producer only)
router.get('/shop/:shopId/subscribers', authenticateToken, getShopSubscribers);

// PUT update subscription status
router.put('/:id', authenticateToken, updateSubscriptionStatus);

// DELETE cancel subscription
router.delete('/:id', authenticateToken, cancelSubscription);

export default router;
