// lambda/health.js - Health check endpoint
const { query } = require('../_database');
const { createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  try {
    await query('SELECT 1');
    return createResponse(200, {
      status: 'OK',
      timestamp: Date.now(),
      database: 'connected'
    });
  } catch (error) {
    return createResponse(500, {
      status: 'ERROR',
      database: 'disconnected'
    });
  }
};