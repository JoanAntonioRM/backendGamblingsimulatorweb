const bcrypt = require('bcryptjs');
const { query } = require('../_database');
const { authenticateToken, validateUsername, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  const auth = authenticateToken(event);
  if (auth.error) {
    return createResponse(auth.statusCode, { error: auth.error });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { newUsername, password } = body;

    if (!validateUsername(newUsername)) {
      return createResponse(400, { error: 'Invalid username format' });
    }

    // Verify password
    const userResult = await query('SELECT password FROM users WHERE id = $1', [auth.user.id]);
    const validPassword = await bcrypt.compare(password, userResult.rows[0].password);
    
    if (!validPassword) {
      return createResponse(400, { error: 'Incorrect password' });
    }

    // Check if username is taken
    const existingUser = await query('SELECT id FROM users WHERE username = $1 AND id != $2', [newUsername, auth.user.id]);
    if (existingUser.rows.length > 0) {
      return createResponse(400, { error: 'Username already taken' });
    }

    // Update username
    await query('UPDATE users SET username = $1 WHERE id = $2', [newUsername, auth.user.id]);

    return createResponse(200, { success: true });
  } catch (error) {
    console.error('Change username error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};