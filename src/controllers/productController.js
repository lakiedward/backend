import { pool } from '../config/database.js';

// Helper: parsează prețul (acceptă virgulă sau punct ca separator zecimal)
const parsePrice = (price) => {
  if (price === null || price === undefined || price === '') return null;
  // Convertește string la număr, înlocuind virgula cu punct
  const parsed = parseFloat(String(price).replace(',', '.'));
  return isNaN(parsed) ? null : parsed;
};

// GET toate produsele unui butic
export const getProductsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const result = await pool.query(`
      SELECT * FROM products 
      WHERE shop_id = $1
      ORDER BY created_at DESC
    `, [shopId]);

    res.json({ products: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// GET produs după ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT p.*, s.name as shop_name, s.user_id as owner_id
      FROM products p
      JOIN shops s ON p.shop_id = s.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// POST adaugă produs la butic
export const createProduct = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { name, description, price, image_url } = req.body;
    const user_id = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    // Verifică dacă buticul aparține utilizatorului
    const checkOwner = await pool.query(
      'SELECT * FROM shops WHERE id = $1 AND user_id = $2',
      [shopId, user_id]
    );

    if (checkOwner.rows.length === 0) {
      return res.status(403).json({ error: 'You can only add products to your own shops' });
    }

    const numericPrice = parsePrice(price);

    const result = await pool.query(`
      INSERT INTO products (shop_id, name, description, price, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [shopId, name, description, numericPrice, image_url]);

    res.status(201).json({
      message: 'Product added successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// POST adaugă mai multe produse la butic (bulk)
export const createProducts = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { products } = req.body;
    const user_id = req.user.id;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    // Verifică dacă buticul aparține utilizatorului
    const checkOwner = await pool.query(
      'SELECT * FROM shops WHERE id = $1 AND user_id = $2',
      [shopId, user_id]
    );

    if (checkOwner.rows.length === 0) {
      return res.status(403).json({ error: 'You can only add products to your own shops' });
    }

    const createdProducts = [];
    
    for (const product of products) {
      if (!product.name) continue;
      
      const numericPrice = parsePrice(product.price);
      
      const result = await pool.query(`
        INSERT INTO products (shop_id, name, description, price, image_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [shopId, product.name, product.description, numericPrice, product.image_url]);
      
      createdProducts.push(result.rows[0]);
    }

    res.status(201).json({
      message: `${createdProducts.length} products added successfully`,
      products: createdProducts
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create products' });
  }
};

// PUT actualizează produs
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, is_available } = req.body;
    const user_id = req.user.id;

    // Verifică dacă produsul aparține unui butic al utilizatorului
    const checkOwner = await pool.query(`
      SELECT p.* FROM products p
      JOIN shops s ON p.shop_id = s.id
      WHERE p.id = $1 AND s.user_id = $2
    `, [id, user_id]);

    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    const numericPrice = price !== undefined ? parsePrice(price) : undefined;

    const result = await pool.query(`
      UPDATE products 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          image_url = COALESCE($4, image_url),
          is_available = COALESCE($5, is_available)
      WHERE id = $6
      RETURNING *
    `, [name, description, numericPrice, image_url, is_available, id]);

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// DELETE șterge produs
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verifică dacă produsul aparține unui butic al utilizatorului
    const checkOwner = await pool.query(`
      SELECT p.* FROM products p
      JOIN shops s ON p.shop_id = s.id
      WHERE p.id = $1 AND s.user_id = $2
    `, [id, user_id]);

    if (checkOwner.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// PUT sincronizare produse (șterge cele vechi și adaugă cele noi)
export const syncProducts = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { products } = req.body;
    const user_id = req.user.id;

    // Verifică dacă buticul aparține utilizatorului
    const checkOwner = await pool.query(
      'SELECT * FROM shops WHERE id = $1 AND user_id = $2',
      [shopId, user_id]
    );

    if (checkOwner.rows.length === 0) {
      return res.status(403).json({ error: 'You can only sync products for your own shops' });
    }

    // Șterge produsele existente
    await pool.query('DELETE FROM products WHERE shop_id = $1', [shopId]);

    // Adaugă produsele noi
    const createdProducts = [];
    
    if (products && Array.isArray(products)) {
      for (const product of products) {
        if (!product.name) continue;
        
        const numericPrice = parsePrice(product.price);
        
        const result = await pool.query(`
          INSERT INTO products (shop_id, name, description, price, image_url)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [shopId, product.name, product.description, numericPrice, product.image_url || product.image]);
        
        createdProducts.push(result.rows[0]);
      }
    }

    res.json({
      message: `Products synced successfully. ${createdProducts.length} products saved.`,
      products: createdProducts
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to sync products' });
  }
};
