// lambda/auth/login.js - User login
const bcrypt = require('bcryptjs');
const { query } = require('../_database');
const { validateUsername, validatePassword, generateToken, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;

    if (!validateUsername(username) || !validatePassword(password)) {
      return createResponse(400, { error: 'Invalid credentials' });
    }

    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return createResponse(400, { error: 'User not found' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return createResponse(400, { error: 'Incorrect password' });
    }

    // Generate token
    const token = generateToken({ id: user.id, username: user.username });

    return createResponse(200, {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: parseFloat(user.balance),
        xp: user.xp,
        shopPoints: user.shop_points
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};