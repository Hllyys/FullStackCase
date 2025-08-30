const { z } = require('zod');
const UserService = require('../services/user.service');

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['fullName', 'email', 'createdAt', 'role', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  depth: z.union([z.literal('all'), z.coerce.number().int().min(0)]).default('1'),
  'filters[fullName]': z.string().optional(),
  'filters[email]': z.string().optional(),
  'filters[role]': z.string().optional(),
  'filters[status]': z.string().optional(),
});

const createSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  roleId: z.number().int(),
  isActive: z.boolean().default(true),
  avatarUrl: z.string().url().optional().nullable(),
  managerId: z.number().int().nullable().optional(),
});

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  roleId: z.number().int().optional(),
  isActive: z.boolean().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  managerId: z.number().int().nullable().optional(),
});

async function listUsers(req, res, next) {
  try {
    const q = querySchema.parse(req.query);
    const filters = {
      fullName: q['filters[fullName]'],
      email: q['filters[email]'],
      role: q['filters[role]'],
      status: q['filters[status]'],
    };
    const out = await UserService.listUsers({
      page: q.page,
      size: q.size,
      sortBy: q.sortBy,
      sortOrder: q.sortOrder,
      depth: q.depth,
      filters,
    });
    res.status(200).json(out);
  } catch (e) {
    next(e);
  }
}

async function createUser(req, res) {
  try {
    const body = createSchema.parse(req.body);
    const user = await UserService.createUser(body);
    res.status(201).json(user);
  } catch (err) {
     const pgDetail = err?.original?.detail || err?.parent?.detail;
  const msg = pgDetail || err?.message || 'Internal server error';
  console.error('CreateUser error:', err);
  return res.status(400).json({ message: msg });
  }
}

async function updateUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    const body = updateSchema.parse(req.body);
    const user = await UserService.updateUser(id, body);
    res.status(200).json({ data: user });
  } catch (e) {
    next(e);
  }
}

async function getUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = await UserService.getUser(id);
    res.status(200).json({ data: user });
  } catch (e) {
    next(e);
  }
}

async function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    const r = await UserService.deleteUser(id);
    res.status(200).json(r);
  } catch (e) {
    next(e);
  }
}

async function getManagerReports(req, res, next) {
  try {
    const id = Number(req.params.id);
    const staffList = await UserService.getAllReports(id);
    res.status(200).json({ data: staffList });
  } catch (e) {
    next(e);
  }
}

module.exports = { listUsers, createUser, updateUser, getUser, deleteUser,getManagerReports };
