const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_TTL });
}

function verifyAccessToken(token) {
  try {
    if (!token) {
      throw ("Token eksik!");
    }
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded;
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      throw ("Geçersiz token imzası!");
    } else if (err.name === "TokenExpiredError") {
      throw("Token süresi dolmuş!");
    } else {
      throw ("Token doğrulama hatası!");
    }
  }
}

function verifyRefreshToken(token) {
  try {
    if (!token) throw("Refresh token eksik!");
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      throw("Geçersiz refresh token imzası!");
    } else if (err.name === "TokenExpiredError") {
      throw ("Refresh token süresi dolmuş!");
    } else {
      throw ("Refresh token doğrulama hatası!");
    }
  }
}

module.exports = { 
  signAccessToken, 
  signRefreshToken, 
  verifyAccessToken, 
  verifyRefreshToken 
};
