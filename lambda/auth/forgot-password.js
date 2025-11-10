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
      return createResponse(400, { 
        error: 'No email associated with this account. Please contact support or create a new account.' 
      });
    }

    // Generate 6-digit code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    );

    // TODO: In production, send this via email service (SendGrid, SES, etc.)
    // For now, we'll simulate it
    console.log(`Reset token for ${username}: ${resetToken}`);

    return createResponse(200, {
      success: true,
      message: `A 6-digit reset code has been sent to ${user.email.substring(0, 3)}***@***`,
      // REMOVE IN PRODUCTION - only for testing:
      _debug_token: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};