const crypto = require('crypto');
const { sequelize } = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { createRefreshToken, findRefreshTokenByHash, revokeRefreshToken } = require('../repositories/refreshToken.repository');
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

function getModels() {
  const { User, Role } = sequelize.models || {};
  if (!User || !Role) throw new Error('Models not initialized. Call initDb() first.');
  return { User, Role };
}

async function register({ fullName, email, password, roleId, managerId = null }) {
  const { User, Role } = getModels();

  const existing = await User.findOne({ where: { email } });
  if (existing) { const err = new Error('Email already in use'); err.status = 409; throw err; }

  // roleId var mı?
  const role = await Role.findByPk(roleId);
  if (!role) { const err = new Error('Role not found'); err.status = 400; throw err; }

  const passwordHash = await hashPassword(password);

  // managerId boş/"" ise null’a çevir
  const mgr = (managerId === undefined || managerId === '') ? null : managerId;

  const user = await User.create({
    fullName, email, passwordHash, roleId: role.id, managerId: mgr, isActive: true
  });

  return user;
}
async function login({ email, password, ip }) {
  try {
    const { User } = getModels();

    const user = await User.findOne({ where: { email } });
    if (!user) { const err = new Error('Invalid credentials'); err.status = 401; throw err; }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) { const err = new Error('Invalid credentials'); err.status = 401; throw err; }

    const accessToken = signAccessToken({ sub: user.id, roleId: user.roleId });
    const refreshTokenPlain = signRefreshToken({ sub: user.id });
    const tokenHash = sha256(refreshTokenPlain);
    const decoded = verifyRefreshToken(refreshTokenPlain);

    await createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(decoded.exp * 1000),
      createdByIp: ip || null
    });

    return { accessToken, refreshToken: refreshTokenPlain, user };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function refresh({ refreshToken }) {
  try {
    const { User } = getModels();

    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = sha256(refreshToken);
    const row = await findRefreshTokenByHash(tokenHash);
    if (!row) { const err = new Error('Refresh token revoked or not found'); err.status = 401; throw err; }

    const user = await User.findByPk(decoded.sub);
    if (!user) { const err = new Error('User not found'); err.status = 404; throw err; }

    const accessToken = signAccessToken({ sub: user.id, roleId: user.roleId });
    return { accessToken };
  } catch (error) {
    console.error('Refresh error:', error);
    throw error;
  }
}

async function logout({ refreshToken }) {
  try {
    const tokenHash = sha256(refreshToken);
    await revokeRefreshToken(tokenHash);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

module.exports = { register, login, refresh, logout };
