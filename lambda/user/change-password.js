const bcrypt = require('bcryptjs');
const { query } = require('../_database');
const { authenticateToken, validatePassword, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  const auth = authenticateToken(event);
  if (auth.error) {
    return createResponse(auth.statusCode, { error: auth.error });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { currentPassword, newPassword } = body;

    console.log('Change password request:', { userId: auth.user.id });

    if (!validatePassword(newPassword)) {
      return createResponse(400, { error: 'Invalid password format' });
    }

    if (!currentPassword) {
      return createResponse(400, { error: 'Current password is required' });
    }

    // Verify current password
    const userResult = await query('SELECT password FROM users WHERE id = $1', [auth.user.id]);
    
    if (userResult.rows.length === 0) {
      return createResponse(404, { error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
    
    if (!validPassword) {
      return createResponse(400, { error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, auth.user.id]);

    console.log('Password updated successfully');
    return createResponse(200, { success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return createResponse(500, { error: 'Server error: ' + error.message });
  }
};