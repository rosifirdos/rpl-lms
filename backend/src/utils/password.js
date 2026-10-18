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

/**
 * Validasi kompleksitas password sesuai standar keamanan SPADA (SRS Bab 35)
 * @param {string} password
 * @returns {object} {isValid: boolean, message: string}
 */
export function validatePasswordComplexity(password) {
  if (typeof password !== 'string') {
    return { isValid: false, message: 'Password harus berupa string' };
  }

  const requirements = [];

  // Minimal 8 karakter
  if (password.length < 8) {
    requirements.push('minimal 8 karakter');
  }

  // Minimal 1 huruf besar
  if (!/[A-Z]/.test(password)) {
    requirements.push('minimal 1 huruf besar (A-Z)');
  }

  // Minimal 1 huruf kecil
  if (!/[a-z]/.test(password)) {
    requirements.push('minimal 1 huruf kecil (a-z)');
  }

  // Minimal 1 angka
  if (!/\d/.test(password)) {
    requirements.push('minimal 1 angka (0-9)');
  }

  // Minimal 1 simbol spesial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    requirements.push('minimal 1 simbol khusus (!@#$%^&* dll.)');
  }

  // Cek common/password sederhana HANYA jika semua requirements terpenuhi
  // Tapi kita cek dulu apakah ada requirements yang belum terpenuhi
  if (requirements.length > 0) {
    return {
      isValid: false,
      message: `Password tidak memenuhi persyaratan keamanan: ${requirements.join(', ')}`
    };
  }

  // Hanya cek common passwords jika semua requirements sudah terpenuhi
  const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'password123'];

  // Cek case-insensitive untuk password yang benar-benar umum
  const lowerPassword = password.toLowerCase();
  let isTooCommon = false;

  // Cek apakah password adalah versi sederhana dari common password
  for (const common of commonPasswords) {
    if (lowerPassword === common) {
      isTooCommon = true;
      break;
    }

    // Juga cek jika password hanya menambahkan angka di akhir common password
    if (lowerPassword.startsWith(common) && /^\d+$/.test(lowerPassword.substring(common.length))) {
      isTooCommon = true;
      break;
    }
  }

  if (isTooCommon) {
    return {
      isValid: false,
      message: 'Password terlalu umum dan mudah ditebak. Gunakan kombinasi yang lebih kompleks.'
    };
  }

  return { isValid: true, message: 'Password memenuhi semua persyaratan keamanan' };
}
