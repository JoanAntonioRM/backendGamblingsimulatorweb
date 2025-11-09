// lambda/_database.js - Optimized for Supabase Connection Pooler
const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      ssl: { 
        rejectUnauthorized: false 
      },
      // Optimized settings for Supabase pooler
      max: 1, // Keep at 1 for serverless
      idleTimeoutMillis: 0, // Disable idle timeout with pooler
      connectionTimeoutMillis: 10000,
    });

    // Add error handler
    pool.on('error', (err) => {
      console.error('Unexpected pool error:', err);
    });
  }
  return pool;
}

async function query(text, params) {
  const pool = getPool();
  try {
    console.log('Executing query:', text.substring(0, 50));
    const result = await pool.query(text, params);
    console.log('Query successful');
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = { query, getPool };