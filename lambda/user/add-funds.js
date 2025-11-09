const { query } = require('../_database');
const { authenticateToken, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  const auth = authenticateToken(event);
  if (auth.error) {
    return createResponse(auth.statusCode, { error: auth.error });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { amount } = body;

    if (typeof amount !== 'number' || amount <= 0) {
      return createResponse(400, { error: 'Invalid amount' });
    }

    const result = await query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
      [amount, auth.user.id]
    );

    return createResponse(200, { 
      success: true, 
      balance: parseFloat(result.rows[0].balance) 
    });
  } catch (error) {
    console.error('Add funds error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};