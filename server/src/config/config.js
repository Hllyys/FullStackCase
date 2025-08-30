require('dotenv/config');
const { parse } = require('pg-connection-string');

const cn = parse(process.env.DATABASE_URL || 'postgres://postgres:1234@127.0.0.1:5433/DevCase');

const base = {
  username: cn.user,
  password: cn.password,
  database: cn.database,
  host: cn.host || '127.0.0.1',
  port: cn.port ? Number(cn.port) : 5432,
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  development: { ...base },
  test:        { ...base },
  production:  { ...base, logging: false },
};
