const express = require('express');
const ctrl = require('../controllers/user.controller');
const { authGuard } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../middleware/validate');
const { z } = require('zod');

const router = express.Router();


const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['fullName', 'email', 'createdAt', 'role', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  depth: z.union([z.literal('all'), z.coerce.number().int().min(0)]).default('1'),
  'filters[fullName]': z.string().optional(),
  'filters[email]': z.string().optional(),
  'filters[role]': z.string().optional(),   
  'filters[status]': z.string().optional()
});


const createSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  roleId: z.number().int(), 
  isActive: z.boolean().default(true),
  avatarUrl: z.string().url().optional().nullable(),
  managerId: z.number().int().nullable().optional()
});

const updateBodySchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  roleId: z.number().int().optional(), 
  isActive: z.boolean().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  managerId: z.number().int().nullable().optional()
});

router.get('/', authGuard, validateQuery(querySchema), ctrl.listUsers);
router.get('/:id', authGuard, ctrl.getUser);

router.post('/', authGuard, validateBody(createSchema), ctrl.createUser);
router.put('/:id', authGuard, validateBody(updateBodySchema), ctrl.updateUser);
router.patch('/:id', authGuard, validateBody(updateBodySchema), ctrl.updateUser);
router.delete('/:id', authGuard, ctrl.deleteUser);
router.get('/:id/reports', authGuard, ctrl.getManagerReports);


module.exports = router;
