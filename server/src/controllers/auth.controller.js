const { z } = require('zod');
const AuthService = require('../services/auth.service');
const { Role } = require('../db/models/role.model');

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  roleId: z.number().int().default(3),              
  managerId: z.number().int().nullable().optional() 
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const refreshSchema = z.object({ refreshToken: z.string().min(10) });

async function register(req, res, next) {
  try {
    const body = registerSchema.parse(req.body); 
    const user = await AuthService.register(body);
    res.status(200).json({ user: { id: user.id, fullName: user.fullName, email: user.email, roleId: user.roleId } });
  } catch (e) { next(e); }
}


async function login(req, res, next) {
  try {
    const body = loginSchema.parse(req.body);
    const { accessToken, refreshToken, user } = await AuthService.login({ ...body, ip: req.ip });
    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roleId: user.roleId
      }
    });
  } catch (e) { next(e); }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const { accessToken } = await AuthService.refresh({ refreshToken });
    res.status(200).json({ accessToken });
  } catch (e) { next(e); }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    await AuthService.logout({ refreshToken });
    res.status(200).json({ success: true });
  } catch (e) { next(e); }
}

module.exports = { register, login, refresh, logout };
