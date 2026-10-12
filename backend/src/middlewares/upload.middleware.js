import multer from 'multer';
import { STORAGE } from '../config/env.js';
import { getFileExtension } from '../utils/storage.js';
import { AppError } from '../utils/errors.js';

// Konfigurasi Memory Storage agar buffer dapat divalidasi sebelum disimpan ke disk
const storage = multer.memoryStorage();

// File filter untuk avatar sesuai FR-007: .jpg, .jpeg, .png, maks 2MB
const avatarFileFilter = (req, file, cb) => {
  const ext = getFileExtension(file.originalname);
  const isAllowedExt = STORAGE.AVATAR_ALLOWED_EXTENSIONS.includes(ext);
  const isAllowedMime = STORAGE.AVATAR_ALLOWED_MIMES.includes(file.mimetype);

  if (!isAllowedExt || !isAllowedMime) {
    return cb(
      new AppError(
        'Format berkas tidak didukung. Harap unggah file berformat .jpg, .jpeg, atau .png',
        400
      ),
      false
    );
  }

  return cb(null, true);
};

const uploadAvatarMulter = multer({
  storage,
  limits: {
    fileSize: STORAGE.AVATAR_MAX_SIZE, // 2MB
  },
  fileFilter: avatarFileFilter,
});

/**
 * Middleware untuk penanganan unggah avatar profil (FR-007)
 * Membaca field `avatar` dari multipart/form-data
 */
export function uploadAvatar(req, res, next) {
  uploadAvatarMulter.single('avatar')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError(
              'Ukuran berkas melebihi batas maksimal yang diizinkan (maksimal 2MB)',
              400
            )
          );
        }
        return next(new AppError(`Kesalahan unggah berkas: ${err.message}`, 400));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new AppError('Berkas foto profil (avatar) wajib diunggah', 400));
    }

    return next();
  });
}
