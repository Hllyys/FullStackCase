const { Sequelize } = require('sequelize');
const { env } = require('./env');
const { initModels } = require('../db/models');

const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function initDb() {
  initModels(sequelize);
  await sequelize.authenticate();

  if (env.DB_SYNC === 'true') {
    await sequelize.sync({ alter: true });
    console.log('Sequelize sync completed.');
  }
}

module.exports = { sequelize, initDb };
