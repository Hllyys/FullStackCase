const { sequelize } = require('../config/db');
const { RefreshToken } = sequelize.models;

function createRefreshToken(entry) {
  return RefreshToken.create(entry);
}

function findRefreshTokenByHash(tokenHash) {
  return RefreshToken.findOne({ where: { tokenHash, revokedAt: null } });
}

async function revokeRefreshToken(tokenHash) {
  const [affected] = await RefreshToken.update(
    { revokedAt: new Date() },
    { where: { tokenHash, revokedAt: null } }
  );
  return affected; // 0 veya 1
}

module.exports = { createRefreshToken, findRefreshTokenByHash, revokeRefreshToken };
