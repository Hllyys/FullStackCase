const { DataTypes, Model } = require('sequelize');

class Role extends Model {
  static initModel(sequelize) {
    Role.init({
      id: { type: DataTypes.INTEGER, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
    }, {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
      timestamps: false,
    });
    return Role;
  }

  static associate(models) {
    Role.hasMany(models.User, { as: 'users', foreignKey: 'roleId' }); // ← SADECE BURADA
  }
}

module.exports = { Role };
