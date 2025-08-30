const {
  findUsers,
  findById,
  createUser: repoCreateUser,
  updateUser: repoUpdateUser,
  deleteUser: repoDeleteUser,
} = require('../repositories/user.repository');
const { toOffsetLimit, toPagination } = require('../utils/pagination');
const { mapUser } = require('../utils/tree');
const { hashPassword } = require('../utils/password');

async function listUsers({ page, size, sortBy, sortOrder, filters }) {
  try {
    const { offset, limit, page: p, size: s } = toOffsetLimit({ page, size });
    const { rows, count } = await findUsers({
      offset,
      limit,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc',
      filters,
    });
    const data = rows.map(mapUser);
    const pagination = toPagination(p, s, count);
    return { data, pagination };
  } catch (error) {
    console.error('ListUsers error:', error);
    throw error;
  }
}

async function getUser(id) {
  try {
    const user = await findById(id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return mapUser(user);
  } catch (error) {
    console.error('GetUser error:', error);
    throw error;
  }
}

async function createUser(payload) {
  try {
    console.log('CREATE USER INPUT:', payload); 
    const toCreate = { ...payload };
    if (payload.password) {
      toCreate.passwordHash = await hashPassword(payload.password);
      delete toCreate.password;
    }
    const user = await repoCreateUser(toCreate);
    return mapUser(user);
  } catch (error) {
    console.error('CreateUser error:', error);
    throw error;
  }
}

async function updateUser(id, patch) {
  try {
    const p = { ...patch };
    if (patch.password) {
      p.passwordHash = await hashPassword(patch.password);
      delete p.password;
    }
    const user = await repoCreateUser; 
    const updated = await repoUpdateUser(id, p);
    if (!updated) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return mapUser(updated);
  } catch (error) {
    console.error('UpdateUser error:', error);
    throw error;
  }
}

async function deleteUser(id) {
  try {
    const n = await repoDeleteUser(id);
    if (n === 0) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return { success: true };
  } catch (error) {
    console.error('DeleteUser error:', error);
    throw error;
  }
}

async function getAllReports(managerId) {
  const directReports = await User.findAll({ where: { managerId } });
  let allReports = [...directReports];

  for (const report of directReports) {
    const subReports = await getAllReports(report.id);
    allReports = allReports.concat(subReports);
  }

  return allReports;
}


module.exports = { listUsers, getUser, createUser, updateUser, deleteUser,getAllReports };
