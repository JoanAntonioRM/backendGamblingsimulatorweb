// lambda/_database.js - Enhanced with better error handling
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
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000, // Increased from 2000
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
    console.log('Executing query:', text.substring(0, 50)); // Log query start
    const result = await pool.query(text, params);
    console.log('Query successful');
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = { query, getPool };