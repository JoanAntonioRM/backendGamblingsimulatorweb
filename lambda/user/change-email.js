const bcrypt = require('bcryptjs');
const { query } = require('../_database');
const { authenticateToken, validateEmail, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  const auth = authenticateToken(event);
  if (auth.error) {
    return createResponse(auth.statusCode, { error: auth.error });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { newEmail, password } = body;

    console.log('Change email request:', { userId: auth.user.id });

    if (!validateEmail(newEmail)) {
      return createResponse(400, { error: 'Invalid email format' });
    }

    if (!password) {
      return createResponse(400, { error: 'Password is required' });
    }

    // Verify password
    const userResult = await query('SELECT password FROM users WHERE id = $1', [auth.user.id]);
    
    if (userResult.rows.length === 0) {
      return createResponse(404, { error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, userResult.rows[0].password);
    
    if (!validPassword) {
      return createResponse(400, { error: 'Incorrect password' });
    }

    // Update email
    await query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, auth.user.id]);

    console.log('Email updated successfully');
    return createResponse(200, { success: true });
  } catch (error) {
    console.error('Change email error:', error);
    return createResponse(500, { error: 'Server error: ' + error.message });
  }
};