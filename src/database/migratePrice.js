import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'shinkansen.proxy.rlwy.net',
  port: 54477,
  user: 'postgres',
  password: 'quGDclRaczihQMKOsyTFEGSPAoqZHAOq',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
});

async function migratePrice() {
  try {
    console.log('🔄 Migrating price column...');
    
    // Șterge produsele existente (au preț text)
    await pool.query('DELETE FROM products');
    console.log('✅ Cleared existing products');
    
    // Schimbă tipul coloanei price în DECIMAL(10,2)
    await pool.query('ALTER TABLE products ALTER COLUMN price TYPE DECIMAL(10,2) USING NULL');
    console.log('✅ Changed price column to DECIMAL(10,2)');
    
    // Verifică structura
    const result = await pool.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'price'
    `);
    console.log('📋 Price column info:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

migratePrice();
