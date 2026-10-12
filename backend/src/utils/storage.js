import crypto from 'crypto';
import path from 'path';
import { STORAGE } from '../config/env.js';

/**
 * Utilitas penyimpanan berkas terproteksi (BR-009, NFR-005)
 *
 * Seluruh berkas disimpan di direktori privat (di luar public web root)
 * dengan nama unik berbasis UUID untuk mencegah tabrakan nama dan
 * manipulasi path traversal.
 */

/**
 * Ambil ekstensi file lowercase dari nama berkas
 */
export function getFileExtension(filename) {
  return path.extname(String(filename || '')).toLowerCase();
}

/**
 * Validasi berkas avatar (FR-007): .jpg/.jpeg/.png, maks 2MB
 *
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAvatar({ originalname, size }) {
  if (size > STORAGE.AVATAR_MAX_SIZE) {
    return {
      valid: false,
      error: `Ukuran berkas melebihi batas maksimal yang diizinkan (maks. 2MB)`,
    };
  }

  const ext = getFileExtension(originalname);
  if (!STORAGE.AVATAR_ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Format berkas tidak didukung. Harap unggah file berformat .jpg, .jpeg, atau .png`,
    };
  }

  return { valid: true };
}

/**
 * Validasi berkas dokumen umum (BR-007): .pdf/.docx/.xlsx/.zip, maks 10MB
 *
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateDocument({ originalname, size }) {
  if (size > STORAGE.DOC_MAX_SIZE) {
    return {
      valid: false,
      error: `Ukuran berkas melebihi batas maksimal yang diizinkan (maks. 10MB)`,
    };
  }

  const ext = getFileExtension(originalname);
  if (!STORAGE.DOC_ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Format berkas tidak didukung. Harap unggah file berformat .pdf, .docx, .xlsx, atau .zip`,
    };
  }

  return { valid: true };
}

/**
 * Sanitasi nama berkas: hilangkan path traversal & karakter berbahaya
 */
export function sanitizeFilename(filename) {
  const base = path.basename(String(filename || 'file'));
  return base.replace(/[^\w.\- ]+/g, '_').replace(/\s+/g, '_');
}

/**
 * Hasilkan nama penyimpanan unik (UUID + ekstensi asli) — BR-009
 */
export function generateStorageName(originalname) {
  const ext = getFileExtension(originalname);
  return `${crypto.randomUUID()}${ext}`;
}

/**
 * Tentukan subdirektori penyimpanan berdasarkan kategori berkas
 */
export function resolveStorageSubdir(category) {
  switch (category) {
    case 'avatar':
      return STORAGE.AVATAR_DIR;
    case 'material':
      return path.resolve(STORAGE.UPLOAD_DIR, 'materials');
    case 'submission':
      return path.resolve(STORAGE.UPLOAD_DIR, 'submissions');
    default:
      return STORAGE.UPLOAD_DIR;
  }
}
