const { query } = require('../_database');
const { authenticateToken, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  const auth = authenticateToken(event);
  if (auth.error) {
    return createResponse(auth.statusCode, { error: auth.error });
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE id = $1', [auth.user.id]);
    if (userResult.rows.length === 0) {
      return createResponse(404, { error: 'User not found' });
    }

    const user = userResult.rows[0];
    const statsResult = await query('SELECT * FROM game_stats WHERE user_id = $1', [user.id]);
    
    const games = {};
    statsResult.rows.forEach(stat => {
      games[stat.game] = {
        played: stat.played,
        won: stat.won,
        lost: stat.lost,
        profit: parseFloat(stat.total_profit || 0)
      };
    });

    const actualProfit = parseFloat(user.total_won) - parseFloat(user.total_bet);

    return createResponse(200, {
      id: user.id,
      username: user.username,
      email: user.email || null,
      balance: parseFloat(user.balance),
      xp: user.xp,
      shopPoints: user.shop_points,
      totalBet: parseFloat(user.total_bet),
      totalWon: parseFloat(user.total_won),
      totalLost: parseFloat(user.total_lost),
      actualProfit: actualProfit,
      games,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Profile error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};