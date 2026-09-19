import bcrypt from 'bcryptjs';

const DEFAULT_SALT_ROUNDS = 10;

/**
 * Hash kata sandi dengan bcrypt
 * @param {string} password
 * @param {number} saltRounds
 * @returns {Promise<string>}
 */
export async function hashPassword(password, saltRounds = DEFAULT_SALT_ROUNDS) {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifikasi kata sandi plaintext dengan hash tersimpan
 * @param {string} password
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
