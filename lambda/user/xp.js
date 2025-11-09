const { query } = require('../_database');
const { authenticateToken, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  const auth = authenticateToken(event);
  if (auth.error) {
    return createResponse(auth.statusCode, { error: auth.error });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { xpGained, shopPointsGained } = body;

    const result = await query(
      'UPDATE users SET xp = xp + $1, shop_points = shop_points + $2 WHERE id = $3 RETURNING xp, shop_points',
      [xpGained, shopPointsGained || 0, auth.user.id]
    );

    return createResponse(200, { 
      success: true, 
      xp: result.rows[0].xp, 
      shopPoints: result.rows[0].shop_points 
    });
  } catch (error) {
    console.error('XP update error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};