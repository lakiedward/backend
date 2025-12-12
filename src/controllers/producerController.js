import { pool } from '../config/database.js';

export const getAllProducers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM producers ORDER BY created_at DESC'
    );
    res.json({ producers: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch producers' });
  }
};

export const getProducerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM producers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producer not found' });
    }

    res.json({ producer: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch producer' });
  }
};

export const createProducer = async (req, res) => {
  try {
    const { name, description, location, phone, email, image_url, products } = req.body;
    const user_id = req.user.id;

    const result = await pool.query(
      `INSERT INTO producers (user_id, name, description, location, phone, email, image_url, products) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [user_id, name, description, location, phone, email, image_url, products]
    );

    res.status(201).json({
      message: 'Producer created successfully',
      producer: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create producer' });
  }
};

export const updateProducer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, phone, email, image_url, products } = req.body;

    const result = await pool.query(
      `UPDATE producers 
       SET name = $1, description = $2, location = $3, phone = $4, email = $5, image_url = $6, products = $7
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [name, description, location, phone, email, image_url, products, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producer not found or unauthorized' });
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

export const deleteProducer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM producers WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producer not found or unauthorized' });
    }

    res.json({ message: 'Producer deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete producer' });
  }
};
