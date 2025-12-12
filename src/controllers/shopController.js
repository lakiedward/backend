import { pool } from '../config/database.js';

// GET toate buticurile (public)
export const getAllShops = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.full_name as owner_name, u.email as owner_email,
             (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id AND p.is_available = true) as product_count
      FROM shops s
      JOIN users u ON s.user_id = u.id
      WHERE s.is_active = true
      ORDER BY s.created_at DESC
    `);
    res.json({ shops: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
};

// GET butic după ID cu produsele sale
export const getShopById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get shop details
    const shopResult = await pool.query(`
      SELECT s.*, u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone
      FROM shops s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [id]);

    if (shopResult.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Get shop products
    const productsResult = await pool.query(`
      SELECT * FROM products 
      WHERE shop_id = $1 AND is_available = true
      ORDER BY created_at DESC
    `, [id]);

    res.json({ 
      shop: shopResult.rows[0],
      products: productsResult.rows
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch shop' });
  }
};

// GET buticurile unui producător
export const getShopsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT s.*,
             (SELECT COUNT(*) FROM products p WHERE p.shop_id = s.id) as product_count
      FROM shops s
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
    `, [userId]);

    res.json({ shops: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch user shops' });
  }
};

// GET buticurile mele (pentru producătorul autentificat)
export const getMyShops = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT s.*,
             (SELECT json_agg(p.*) FROM products p WHERE p.shop_id = s.id) as products
      FROM shops s
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
    `, [userId]);

    res.json({ shops: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch your shops' });
  }
};

// POST crează butic nou
export const createShop = async (req, res) => {
  try {
    const { name, specialty, description, location, image_url } = req.body;
    const user_id = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Shop name is required' });
    }

    const result = await pool.query(`
      INSERT INTO shops (user_id, name, specialty, description, location, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [user_id, name, specialty, description, location, image_url]);

    res.status(201).json({
      message: 'Shop created successfully',
      shop: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create shop' });
  }
};

// PUT actualizează butic
export const updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, description, location, image_url, is_active } = req.body;
    const user_id = req.user.id;

    // Verifică dacă buticul aparține utilizatorului
    const checkOwner = await pool.query(
      'SELECT * FROM shops WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found or unauthorized' });
    }

    const result = await pool.query(`
      UPDATE shops 
      SET name = COALESCE($1, name),
          specialty = COALESCE($2, specialty),
          description = COALESCE($3, description),
          location = COALESCE($4, location),
          image_url = COALESCE($5, image_url),
          is_active = COALESCE($6, is_active)
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `, [name, specialty, description, location, image_url, is_active, id, user_id]);

    res.json({
      message: 'Shop updated successfully',
      shop: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update shop' });
  }
};

// DELETE șterge butic
export const deleteShop = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'DELETE FROM shops WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found or unauthorized' });
    }

    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete shop' });
  }
};
