const { query } = require('../_database');
const { authenticateToken, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  const auth = authenticateToken(event);
  if (auth.error) {
    return createResponse(auth.statusCode, { error: auth.error });
  }

  try {
    await query('DELETE FROM game_stats WHERE user_id = $1', [auth.user.id]);
    await query('DELETE FROM users WHERE id = $1', [auth.user.id]);
    return createResponse(200, { success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};