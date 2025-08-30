const { Role } = require('./role.model');
const { User } = require('./user.model');
const { RefreshToken } = require('./refreshToken.model');

function initModels(sequelize) {
  Role.initModel(sequelize);
  User.initModel(sequelize);
  RefreshToken.initModel(sequelize);

  const models = { Role, User, RefreshToken };

  Role.associate?.(models);
  User.associate?.(models);
  RefreshToken.associate?.(models);

  return models;
}

module.exports = { initModels };
