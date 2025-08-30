require('dotenv/config');

const DEFAULT_URL =
  process.env.DATABASE_URL ||
  'postgres://postgres:1234@127.0.0.1:5433/DevCase';

module.exports = {
  development: { url: DEFAULT_URL, dialect: 'postgres', logging: false },
  test:        { url: DEFAULT_URL, dialect: 'postgres', logging: false },
  production:  { url: process.env.DATABASE_URL, dialect: 'postgres', logging: false }
};
