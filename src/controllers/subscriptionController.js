import { pool } from '../config/database.js';

// Initialize subscription tables
export const initSubscriptionTables = async () => {
  try {
    // Table for shop subscription configuration (producer settings)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shop_subscriptions (
        id SERIAL PRIMARY KEY,
        shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
        description TEXT,
        price VARCHAR(100),
        selected_products INTEGER[],
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(shop_id)
      )
    `);

    // Table for user subscriptions to shops
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cancelled_at TIMESTAMP,
        UNIQUE(user_id, shop_id)
      )
    `);

    console.log('✅ Subscription tables initialized');
  } catch (error) {
    console.error('❌ Error initializing subscription tables:', error);
  }
};

// Initialize tables on module load
initSubscriptionTables();

// ============================================
// SHOP SUBSCRIPTION CONFIGURATION (for producers)
// ============================================

// GET /api/subscriptions/shop/:shopId/config - Get shop subscription config
export const getShopSubscriptionConfig = async (req, res) => {
  try {
    const { shopId } = req.params;

    const result = await pool.query(
      'SELECT * FROM shop_subscriptions WHERE shop_id = $1',
      [shopId]
    );

    if (result.rows.length === 0) {
      return res.json({ 
        subscription: null,
        message: 'No subscription configured for this shop'
      });
    }

    res.json({ subscription: result.rows[0] });
  } catch (error) {
    console.error('Error fetching shop subscription config:', error);
    res.status(500).json({ error: 'Failed to fetch subscription config' });
  }
};

// POST /api/subscriptions/shop/:shopId/config - Create/Update shop subscription config
export const upsertShopSubscriptionConfig = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { description, price, selectedProducts, isActive } = req.body;
    const userId = req.user?.id;

    // Verify user owns the shop
    const shopCheck = await pool.query(
      'SELECT user_id FROM shops WHERE id = $1',
      [shopId]
    );

    if (shopCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (shopCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only configure subscriptions for your own shop' });
    }

    // Upsert subscription config
    const result = await pool.query(`
      INSERT INTO shop_subscriptions (shop_id, description, price, selected_products, is_active, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (shop_id)
      DO UPDATE SET 
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        selected_products = EXCLUDED.selected_products,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [shopId, description, price, selectedProducts || [], isActive || false]);

    res.json({ 
      message: 'Subscription config saved successfully',
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving shop subscription config:', error);
    res.status(500).json({ error: 'Failed to save subscription config' });
  }
};

// DELETE /api/subscriptions/shop/:shopId/config - Delete shop subscription config
export const deleteShopSubscriptionConfig = async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user?.id;

    // Verify user owns the shop
    const shopCheck = await pool.query(
      'SELECT user_id FROM shops WHERE id = $1',
      [shopId]
    );

    if (shopCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (shopCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete subscriptions for your own shop' });
    }

    await pool.query('DELETE FROM shop_subscriptions WHERE shop_id = $1', [shopId]);

    res.json({ message: 'Subscription config deleted successfully' });
  } catch (error) {
    console.error('Error deleting shop subscription config:', error);
    res.status(500).json({ error: 'Failed to delete subscription config' });
  }
};

// ============================================
// USER SUBSCRIPTIONS (for customers)
// ============================================

// POST /api/subscriptions - User subscribes to a shop
export const subscribeToShop = async (req, res) => {
  try {
    const { shopId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!shopId) {
      return res.status(400).json({ error: 'Shop ID is required' });
    }

    // Check if shop exists and has active subscription
    const shopCheck = await pool.query(`
      SELECT s.*, ss.is_active 
      FROM shops s 
      LEFT JOIN shop_subscriptions ss ON s.id = ss.shop_id 
      WHERE s.id = $1
    `, [shopId]);

    if (shopCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (!shopCheck.rows[0].is_active) {
      return res.status(400).json({ error: 'This shop is not accepting subscriptions' });
    }

    // Check if user is not subscribing to their own shop
    if (shopCheck.rows[0].user_id === userId) {
      return res.status(400).json({ error: 'You cannot subscribe to your own shop' });
    }

    // Create subscription
    const result = await pool.query(`
      INSERT INTO user_subscriptions (user_id, shop_id, status, subscribed_at)
      VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, shop_id)
      DO UPDATE SET status = 'pending', subscribed_at = CURRENT_TIMESTAMP, cancelled_at = NULL
      RETURNING *
    `, [userId, shopId]);

    res.status(201).json({ 
      message: 'Subscription request sent successfully',
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Error subscribing to shop:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};

// GET /api/subscriptions/user - Get user's subscriptions
export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await pool.query(`
      SELECT us.*, s.name as shop_name, s.image_url as shop_image, 
             ss.description, ss.price, ss.selected_products
      FROM user_subscriptions us
      JOIN shops s ON us.shop_id = s.id
      LEFT JOIN shop_subscriptions ss ON s.id = ss.shop_id
      WHERE us.user_id = $1
      ORDER BY us.subscribed_at DESC
    `, [userId]);

    res.json({ subscriptions: result.rows });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

// GET /api/subscriptions/shop/:shopId/subscribers - Get shop's subscribers (for producer)
export const getShopSubscribers = async (req, res) => {
  try {
    const { shopId } = req.params;
    const userId = req.user?.id;

    // Verify user owns the shop
    const shopCheck = await pool.query(
      'SELECT user_id FROM shops WHERE id = $1',
      [shopId]
    );

    if (shopCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (shopCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only view subscribers for your own shop' });
    }

    const result = await pool.query(`
      SELECT us.*, u.full_name as user_name, u.email as user_email
      FROM user_subscriptions us
      JOIN users u ON us.user_id = u.id
      WHERE us.shop_id = $1
      ORDER BY us.subscribed_at DESC
    `, [shopId]);

    res.json({ subscribers: result.rows });
  } catch (error) {
    console.error('Error fetching shop subscribers:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
};

// PUT /api/subscriptions/:id - Update subscription status
export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    // Get subscription details
    const subCheck = await pool.query(`
      SELECT us.*, s.user_id as shop_owner_id
      FROM user_subscriptions us
      JOIN shops s ON us.shop_id = s.id
      WHERE us.id = $1
    `, [id]);

    if (subCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const subscription = subCheck.rows[0];

    // Only shop owner or subscriber can update
    if (subscription.shop_owner_id !== userId && subscription.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this subscription' });
    }

    const validStatuses = ['pending', 'active', 'cancelled', 'paused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const cancelledAt = status === 'cancelled' ? 'CURRENT_TIMESTAMP' : 'NULL';

    const result = await pool.query(`
      UPDATE user_subscriptions 
      SET status = $1, cancelled_at = ${status === 'cancelled' ? 'CURRENT_TIMESTAMP' : 'NULL'}
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    res.json({ 
      message: 'Subscription updated successfully',
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

// DELETE /api/subscriptions/:id - Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get subscription
    const subCheck = await pool.query(
      'SELECT * FROM user_subscriptions WHERE id = $1',
      [id]
    );

    if (subCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Only subscriber can cancel their own subscription
    if (subCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'You can only cancel your own subscriptions' });
    }

    await pool.query(`
      UPDATE user_subscriptions 
      SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};
