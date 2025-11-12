const bcrypt = require('bcryptjs');
const { query } = require('../_database');
const { validateUsername, validatePassword, validateEmail, generateToken, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { username, password, email } = body;

    if (!validateUsername(username)) {
      return createResponse(400, { error: 'Invalid username format' });
    }
    if (!validatePassword(password)) {
      return createResponse(400, { error: 'Password must be 6-50 characters' });
    }
    if (email && !validateEmail(email)) {
      return createResponse(400, { error: 'Invalid email format' });
    }

    const existingUser = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return createResponse(400, { error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, balance, xp, shop_points',
      [username, hashedPassword, email || null]
    );

    const userId = result.rows[0].id;

    // UPDATED: Include roulette and cardpacks
    const games = ['crash', 'dice', 'blackjack', 'plinko', 'mines', 'cases', 'roulette', 'cardpacks'];
    for (const game of games) {
      await query('INSERT INTO game_stats (user_id, game) VALUES ($1, $2)', [userId, game]);
    }

    const token = generateToken({ id: userId, username });

    return createResponse(200, {
      success: true,
      token,
      user: {
        id: userId,
        username: result.rows[0].username,
        balance: parseFloat(result.rows[0].balance),
        xp: result.rows[0].xp,
        shopPoints: result.rows[0].shop_points
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};