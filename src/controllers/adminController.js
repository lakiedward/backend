import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

// ========== USERS ==========

// GET all users
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, full_name, phone, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// GET user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT id, email, full_name, phone, role, created_at, updated_at
      FROM users WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// PUT update user (admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, phone, role } = req.body;

    const result = await pool.query(`
      UPDATE users 
      SET email = COALESCE($1, email),
          full_name = COALESCE($2, full_name),
          phone = COALESCE($3, phone),
          role = COALESCE($4, role),
          updated_at = NOW()
      WHERE id = $5
      RETURNING id, email, full_name, phone, role, created_at, updated_at
    `, [email, full_name, phone, role, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// DELETE user (admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ========== SHOPS ==========

// GET all shops (admin - include inactive)
export const getAllShopsAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.full_name as owner_name, u.email as owner_email,
             (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id) as product_count
      FROM shops s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    res.json({ shops: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
};

// PUT update any shop (admin)
export const updateShopAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, description, location, image_url, is_active } = req.body;

    const result = await pool.query(`
      UPDATE shops 
      SET name = COALESCE($1, name),
          specialty = COALESCE($2, specialty),
          description = COALESCE($3, description),
          location = COALESCE($4, location),
          image_url = COALESCE($5, image_url),
          is_active = COALESCE($6, is_active),
          updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [name, specialty, description, location, image_url, is_active, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json({
      message: 'Shop updated successfully',
      shop: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update shop' });
  }
};

// DELETE any shop (admin)
export const deleteShopAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM shops WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete shop' });
  }
};

// ========== PRODUCERS ==========

// GET all producers (admin)
export const getAllProducersAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.email as user_email, u.full_name as user_name
      FROM producers p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json({ producers: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch producers' });
  }
};

// PUT update any producer (admin)
export const updateProducerAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, phone, email, image_url } = req.body;

    const result = await pool.query(`
      UPDATE producers 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          location = COALESCE($3, location),
          phone = COALESCE($4, phone),
          email = COALESCE($5, email),
          image_url = COALESCE($6, image_url)
      WHERE id = $7
      RETURNING *
    `, [name, description, location, phone, email, image_url, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producer not found' });
    }

    res.json({
      message: 'Producer updated successfully',
      producer: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update producer' });
  }
};

// DELETE any producer (admin)
export const deleteProducerAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM producers WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producer not found' });
    }

    res.json({ message: 'Producer deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete producer' });
  }
};

// ========== PRODUCTS ==========

// GET all products (admin)
export const getAllProductsAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, s.name as shop_name, u.full_name as owner_name
      FROM products p
      JOIN shops s ON p.shop_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json({ products: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// PUT update any product (admin)
export const updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, is_available } = req.body;

    const result = await pool.query(`
      UPDATE products 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          image_url = COALESCE($4, image_url),
          is_available = COALESCE($5, is_available),
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [name, description, price, image_url, is_available, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// DELETE any product (admin)
export const deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// ========== STATS ==========

// GET dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const shopsCount = await pool.query('SELECT COUNT(*) FROM shops');
    const productsCount = await pool.query('SELECT COUNT(*) FROM products');
    const producersCount = await pool.query('SELECT COUNT(*) FROM producers');

    res.json({
      stats: {
        users: parseInt(usersCount.rows[0].count),
        shops: parseInt(shopsCount.rows[0].count),
        products: parseInt(productsCount.rows[0].count),
        producers: parseInt(producersCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
