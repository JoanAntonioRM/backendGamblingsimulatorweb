const { query } = require('../_database');
const { authenticateToken, createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  const auth = authenticateToken(event);
  if (auth.error) {
    return createResponse(auth.statusCode, { error: auth.error });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { game, won, betAmount, winAmount } = body;

    const validGames = ['crash', 'dice', 'blackjack', 'plinko', 'mines', 'cases', 'roulette', 'cardpacks'];
    if (!validGames.includes(game)) {
      return createResponse(400, { error: 'Invalid game' });
    }

    const wonValue = won ? 1 : 0;
    const lostValue = won ? 0 : 1;
    const profit = winAmount - betAmount;

    await query(
      `UPDATE game_stats SET 
        played = played + 1,
        won = won + $1,
        lost = lost + $2,
        total_profit = total_profit + $3
       WHERE user_id = $4 AND game = $5`,
      [wonValue, lostValue, profit, auth.user.id, game]
    );

    const wonAmount = won ? winAmount : 0;
    const lostAmount = won ? 0 : betAmount;

    await query(
      `UPDATE users SET 
        total_bet = total_bet + $1,
        total_won = total_won + $2,
        total_lost = total_lost + $3
       WHERE id = $4`,
      [betAmount, wonAmount, lostAmount, auth.user.id]
    );

    return createResponse(200, { success: true });
  } catch (error) {
    console.error('Game stats error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};