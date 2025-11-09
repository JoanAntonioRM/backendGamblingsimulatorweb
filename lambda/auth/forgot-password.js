const crypto = require('crypto');
const { query } = require('../_database');
const { validateUsername, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { username } = body;

    if (!validateUsername(username)) {
      return createResponse(400, { error: 'Invalid username' });
    }

    const result = await query('SELECT id, email FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return createResponse(400, { error: 'User not found' });
    }

    const user = result.rows[0];
    if (!user.email) {
      return createResponse(400, { error: 'No email associated with this account' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    await query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    );

    return createResponse(200, {
      success: true,
      message: 'Password reset token generated',
      resetToken // REMOVE THIS IN PRODUCTION
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};