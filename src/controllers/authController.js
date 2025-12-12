import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'piata-dumbravita-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const registerUser = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
      [email, hashedPassword, fullName, role || 'user']
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
      token
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
      token
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, phone, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    
    // Dacă e producător, adaugă și datele din shops
    if (user.role === 'producer') {
      const shopsResult = await pool.query(
        'SELECT * FROM shops WHERE user_id = $1',
        [user.id]
      );
      user.shops = shopsResult.rows;
    }

    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at,
        shops: user.shops || []
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Înregistrare producător
export const registerProducer = async (req, res) => {
  try {
    const { email, password, fullName, phone, specialty, location, description } = req.body;

    // Validări
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [
          !email && { field: 'email', message: 'Email is required' },
          !password && { field: 'password', message: 'Password is required' },
          !fullName && { field: 'fullName', message: 'Full name is required' }
        ].filter(Boolean)
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [{ field: 'password', message: 'Password must be at least 8 characters' }]
      });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with producer role
    const userResult = await pool.query(
      'INSERT INTO users (email, password, full_name, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, phone',
      [email, hashedPassword, fullName, 'producer', phone]
    );

    const user = userResult.rows[0];

    // Create initial shop for producer
    const shopResult = await pool.query(
      'INSERT INTO shops (user_id, name, specialty, location, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user.id, fullName, specialty, location, description]
    );

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Producer registered successfully',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        shop: shopResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone } = req.body;
    const userId = req.user.id;

    // Verifică dacă utilizatorul își editează propriul profil
    if (parseInt(id) !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone) WHERE id = $3 RETURNING id, email, full_name, phone, role',
      [fullName, phone, id]
    );

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

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validări
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [
          !currentPassword && { field: 'currentPassword', message: 'Current password is required' },
          !newPassword && { field: 'newPassword', message: 'New password is required' }
        ].filter(Boolean)
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [{ field: 'newPassword', message: 'New password must be at least 8 characters' }]
      });
    }

    // Get current user
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
