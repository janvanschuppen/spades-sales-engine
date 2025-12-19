require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create Integrations Table
    await client.query(`
        CREATE TABLE IF NOT EXISTS organization_integrations (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
          provider TEXT NOT NULL,
          api_key TEXT NOT NULL,
          settings JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(organization_id, provider)
        );
    `);

    await client.query('COMMIT');
    console.log('Migration successful: organization_integrations created.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();