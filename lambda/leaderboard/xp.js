// lambda/leaderboard/xp.js - NEW FILE
const { query } = require('../_database');
const { createResponse } = require('../_utils');

// Import ranking system
const RANKS = [
    { name: 'No Rank', emoji: '⚪', minXP: 0 },
    { name: 'Bronze', emoji: '🥉', minXP: 50 },
    { name: 'Silver', emoji: '🥈', minXP: 100 },
    { name: 'Gold', emoji: '🥇', minXP: 200 },
    { name: 'Platinum', emoji: '💎', minXP: 300 },
    { name: 'Diamond', emoji: '💠', minXP: 600 },
    { name: 'Ruby', emoji: '💜', minXP: 800 },
    { name: 'Master', emoji: '🎖️', minXP: 1500 },
    { name: 'Grandmaster', emoji: '👑', minXP: 2500 },
    { name: 'Legend', emoji: '🌟', minXP: 3500 },
    { name: 'Mythic', emoji: '🦄', minXP: 6000 },
    { name: 'Immortal', emoji: '🛡️', minXP: 8000 },
    { name: 'Eternal', emoji: '🔱', minXP: 10000 }
];

function getRank(xp) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (xp >= RANKS[i].minXP) {
            return { ...RANKS[i], index: i };
        }
    }
    return { ...RANKS[0], index: 0 };
}

module.exports.handler = async (event) => {
  try {
    const result = await query(
      `SELECT username, xp 
       FROM users 
       ORDER BY xp DESC 
       LIMIT 50`
    );

    // Add rank info to each user
    const leaderboard = result.rows.map(user => {
      const rank = getRank(user.xp);
      return {
        username: user.username,
        xp: user.xp,
        rank: rank.name,
        rankEmoji: rank.emoji,
        rankIndex: rank.index
      };
    });

    return createResponse(200, leaderboard);
  } catch (error) {
    console.error('XP Leaderboard error:', error);
    return createResponse(500, { error: 'Server error' });
  }
};