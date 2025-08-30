const { DataTypes, Model } = require('sequelize');

class RefreshToken extends Model {
  static initModel(sequelize) {
    RefreshToken.init({
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      tokenHash: { type: DataTypes.STRING(160), allowNull: false },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      revokedAt: { type: DataTypes.DATE, allowNull: true },
      createdByIp: { type: DataTypes.STRING(64), allowNull: true },
    }, {
      sequelize,
      modelName: 'RefreshToken',
      tableName: 'refresh_tokens',
      timestamps: true,
    });
    return RefreshToken;
  }

  static associate(models) {
    RefreshToken.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  }
}

module.exports = { RefreshToken };
