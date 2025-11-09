// lambda/health.js - Enhanced error reporting
const { query } = require('./_database');
const { createResponse } = require('./_utils');

module.exports.handler = async (event) => {
  console.log('Health check started');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

  try {
    console.log('Testing database connection...');
    const result = await query('SELECT 1 as health');
    console.log('Database query result:', result.rows);
    
    return createResponse(200, {
      status: 'OK',
      timestamp: Date.now(),
      database: 'connected',
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return createResponse(500, {
      status: 'ERROR',
      database: 'disconnected',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};