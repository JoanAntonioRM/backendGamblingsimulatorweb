const bcrypt = require('bcryptjs');
const { query } = require('../_database');
const { validatePassword, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { resetToken, newPassword } = body;

    if (!resetToken || !validatePassword(newPassword)) {
      return createResponse(400, { error: 'Invalid request' });
    }

    const result = await query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > $2',
      [resetToken, Date.now()]
    );

    if (result.rows.length === 0) {
      return createResponse(400, { error: 'Invalid or expired reset token' });
    }

    const userId = result.rows[0].id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, userId]
    );

    return createResponse(200, { success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};