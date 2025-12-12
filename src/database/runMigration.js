import pg from 'pg';

const { Pool } = pg;

// External Railway PostgreSQL connection
const pool = new Pool({
  host: 'shinkansen.proxy.rlwy.net',
  port: 54477,
  user: 'postgres',
  password: 'quGDclRaczihQMKOsyTFEGSPAoqZHAOq',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
});

const migration = `
-- Tabel SHOPS (Buticuri/Firme ale producătorilor)
CREATE TABLE IF NOT EXISTS shops (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabel PRODUCTS (Produsele fiecărui butic)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price VARCHAR(100),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_shops_is_active ON shops(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
`;

async function runMigration() {
  try {
    console.log('🔄 Running migration...');
    await pool.query(migration);
    console.log('✅ Migration completed successfully!');
    
    // Verify tables exist
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('shops', 'products')
    `);
    console.log('📋 Tables created:', tablesResult.rows.map(r => r.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

runMigration();
