const { query } = require('../_database');
const { createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  try {
    const game = event.pathParameters?.game;
    const validGames = ['crash', 'dice', 'blackjack', 'plinko', 'mines', 'cases', 'roulette', 'cardpacks'];
    
    if (!validGames.includes(game)) {
      return createResponse(400, { error: 'Invalid game' });
    }

    // For cases, order by profit instead of wins
    const orderBy = game === 'cases' ? 'g.total_profit' : 'g.won';

    const result = await query(
      `SELECT u.username, g.won, g.total_profit 
       FROM game_stats g 
       JOIN users u ON g.user_id = u.id 
       WHERE g.game = $1 
       ORDER BY ${orderBy} DESC 
       LIMIT 25`,
      [game]
    );

    return createResponse(200, result.rows);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};