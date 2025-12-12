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

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('Users table columns:');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
