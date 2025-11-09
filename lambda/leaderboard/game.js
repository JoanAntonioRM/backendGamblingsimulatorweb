const { query } = require('../_database');
const { createResponse } = require('../_utils');

module.exports.handler = async (event) => {
  try {
    const game = event.pathParameters?.game;
    const validGames = ['crash', 'dice', 'blackjack', 'plinko', 'mines', 'cases'];
    
    if (!validGames.includes(game)) {
      return createResponse(400, { error: 'Invalid game' });
    }

    const result = await query(
      `SELECT u.username, g.won 
       FROM game_stats g 
       JOIN users u ON g.user_id = u.id 
       WHERE g.game = $1 
       ORDER BY g.won DESC 
       LIMIT 25`,
      [game]
    );

    return createResponse(200, result.rows);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};