const { DataTypes, Model } = require('sequelize');

class User extends Model {
  static initModel(sequelize) {
    User.init({
      fullName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      roleId: { type: DataTypes.INTEGER, allowNull: false },
      managerId: { type: DataTypes.INTEGER, allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      avatarUrl: { type: DataTypes.STRING, allowNull: true },
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
    });
    return User;
  }

  static associate(models) {
   
    User.belongsTo(models.Role, { as: 'role', foreignKey: 'roleId' });

    // Self relation
    User.belongsTo(models.User, { as: 'manager', foreignKey: 'managerId', onDelete: 'SET NULL' });
    User.hasMany(models.User, { as: 'reports', foreignKey: 'managerId', onDelete: 'SET NULL' });
  }
}

module.exports = { User };
