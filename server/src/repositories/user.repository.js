const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { User, Role } = sequelize.models;

async function findUsers({ offset, limit, sortBy, sortOrder, filters }) {
  const where = {};
  if (filters?.fullName) where.fullName = { [Op.iLike]: `%${filters.fullName}%` };
  if (filters?.email) where.email = { [Op.iLike]: `%${filters.email}%` };
  if (filters?.status === 'active') where.isActive = true;
  if (filters?.status === 'inactive') where.isActive = false;

  const include = [{ model: Role, as: 'role', attributes: ['id', 'name'], required: !!filters?.role }];
  if (filters?.role) include[0].where = { name: { [Op.iLike]: filters.role } };

  const dir = (sortOrder || 'desc').toUpperCase();
  let order = [[sortBy || 'createdAt', dir]];
  if (sortBy === 'status') order = [['isActive', dir]];
  if (sortBy === 'role') order = [[{ model: Role, as: 'role' }, 'name', dir]];

  const { rows, count } = await User.findAndCountAll({
    where,
    include,
    offset,
    limit,
    order,
  });
  return { rows, count };
}

function findById(id) {
  return User.findByPk(id, { include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }] });
}

async function findChildrenOf(managerIds) {
  if (!managerIds || managerIds.length === 0) return [];
  return User.findAll({
    where: { managerId: { [Op.in]: managerIds } },
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
  });
}

function createUser(data) {
  return User.create(data);
}

async function updateUser(id, updates) {
  try {
    // 1. Güncellenecek kullanıcıyı bul
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error(`User with id=${id} not found`);
    }

    // 2. ManagerId doğrulaması
    if (updates.managerId) {
      const manager = await User.findByPk(updates.managerId);
      if (!manager) {
        throw new Error(`Manager with id=${updates.managerId} does not exist`);
      }
    }

    // 3. Alanları güncelle
    Object.assign(user, updates);

    // 4. DB'ye kaydet
    await user.save();

    return user;
  } catch (err) {
    console.error('UpdateUser error:', err);
    throw err;
  }
}

async function deleteUser(id) {
  const user = await User.findByPk(id);
  if (!user) return 0;
  await user.destroy();
  return 1;
}

module.exports = { findUsers, findById, findChildrenOf, createUser, updateUser, deleteUser };
