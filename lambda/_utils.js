// lambda/_utils.js - Helper functions for Lambda
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function validateUsername(username) {
  if (!username || typeof username !== 'string') return false;
  if (username.length < 3 || username.length > 20) return false;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;
  return true;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 6 || password.length > 50) return false;
  return true;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function authenticateToken(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Access denied', statusCode: 401 };
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return { user };
  } catch (err) {
    return { error: 'Invalid token', statusCode: 403 };
  }
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  };
}

module.exports = {
  validateUsername,
  validatePassword,
  validateEmail,
  authenticateToken,
  generateToken,
  createResponse,
};