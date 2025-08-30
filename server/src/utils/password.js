const bcrypt = require('bcryptjs');
const ROUNDS = 10;

async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(ROUNDS);
  return bcrypt.hash(plain, salt);
}
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
module.exports = { hashPassword, verifyPassword };
