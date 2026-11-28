import multer from 'multer';
import { STORAGE } from '../config/env.js';
import { DOCUMENT_MIME_TYPES, getFileExtension } from '../utils/storage.js';
import { AppError } from '../utils/errors.js';
import { ConfigService } from '../modules/config/config.service.js';

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

// File filter untuk materi pembelajaran sesuai BR-007: .pdf, .docx, .xlsx, .zip, maks 10MB
const materialFileFilter = (req, file, cb) => {
  const ext = getFileExtension(file.originalname);
  const isAllowedExt = STORAGE.DOC_ALLOWED_EXTENSIONS.includes(ext);

  if (!isAllowedExt) {
    return cb(
      new AppError(
        'Format berkas tidak didukung. Harap unggah file berformat .pdf, .docx, .xlsx, atau .zip',
        400
      ),
      false
    );
  }

  return cb(null, true);
};

const uploadMaterialMulter = multer({
  storage,
  limits: {
    fileSize: STORAGE.DOC_MAX_SIZE, // 10MB
  },
  fileFilter: materialFileFilter,
});

/**
 * Middleware untuk penanganan unggah berkas materi pembelajaran (BR-007, BR-009)
 * Membaca field `file` dari multipart/form-data.
 *
 * Berkas ditahan di memory storage agar controller dapat memvalidasi ukuran dan
 * ekstensi sebelum menulis ke direktori privat `storage/private/materials/`.
 * Nama field `file` mengikuti konvensi `multipart/form-data` pada dokumentasi
 * OpenAPI (satu berkas per entri materi).
 */
export function uploadMaterial(req, res, next) {
  uploadMaterialMulter.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            new AppError(
              'Ukuran berkas melebihi batas maksimal yang diizinkan (maksimal 10MB)',
              400
            )
          );
        }
        return next(new AppError(`Kesalahan unggah berkas: ${err.message}`, 400));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new AppError('Berkas materi pembelajaran wajib diunggah', 400));
    }

    return next();
  });
}

/** MIME netral yang tidak membocorkan format; signature tetap diverifikasi. */
const OCTET_STREAM_MIME = 'application/octet-stream';

/** Ubah ukuran byte menjadi label MB yang rapi (mis. 10, 7.5). */
function formatMegabytes(bytes) {
  const megabytes = bytes / (1024 * 1024);
  return Number.isInteger(megabytes) ? String(megabytes) : String(Math.round(megabytes * 100) / 100);
}

/**
 * Factory middleware unggah dokumen (BR-007, BR-009, FR-019).
 *
 * Perilaku yang dijaga:
 *   - Whitelist ekstensi `STORAGE.DOC_ALLOWED_EXTENSIONS`.
 *   - MIME yang dideklarasikan harus cocok dengan ekstensi. `application/
 *     octet-stream` ditoleransi karena sebagian klien tidak mengirim MIME
 *     spesifik; isi berkas tetap diverifikasi lewat magic-byte di service.
 *   - Berkas ditahan di memory storage; validasi signature/ukuran final
 *     dilakukan service sebelum menulis ke private storage.
 *
 * @param {object} options
 * @param {string} [options.field='file'] nama field multipart
 * @param {number} [options.maxSize] batas ukuran byte
 * @param {string} [options.label='dokumen'] label untuk pesan galat
 * @param {boolean} [options.required=true] wajib ada berkas?
 * @returns {import('express').RequestHandler}
 */
export function createDocumentUploader({
  field = 'file',
  maxSize = STORAGE.DOC_MAX_SIZE,
  label = 'dokumen',
  required = true,
} = {}) {
  const maxSizeLabel = formatMegabytes(maxSize);

  const instance = multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      const ext = getFileExtension(file.originalname);
      if (!STORAGE.DOC_ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(
          new AppError(
            'Format berkas tidak didukung. Harap unggah file berformat .pdf, .docx, .xlsx, atau .zip',
            400
          ),
          false
        );
      }

      const declaredMime = String(file.mimetype || '').trim().toLowerCase();
      const allowedMimes = DOCUMENT_MIME_TYPES[ext] || [];
      if (declaredMime && declaredMime !== OCTET_STREAM_MIME && !allowedMimes.includes(declaredMime)) {
        return cb(
          new AppError('Tipe berkas (MIME) tidak sesuai dengan ekstensi berkas', 400),
          false
        );
      }

      return cb(null, true);
    },
  });

  return function documentUpload(req, res, next) {
    instance.single(field)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(
              new AppError(
                `Ukuran berkas melebihi batas maksimal (maks ${maxSizeLabel}MB)`,
                400
              )
            );
          }
          return next(new AppError(`Kesalahan unggah berkas: ${err.message}`, 400));
        }
        return next(err);
      }

      if (required && !req.file) {
        return next(new AppError(`Berkas ${label} wajib diunggah`, 400));
      }

      return next();
    });
  };
}

/**
 * Berkas soal tugas — OPSIONAL (Pertemuan 3 dst, FR-032).
 * Batas 10MB mengikuti kebijakan dokumen BR-007.
 */
export const uploadAssignmentFile = createDocumentUploader({
  field: 'file',
  maxSize: STORAGE.DOC_MAX_SIZE,
  label: 'soal tugas',
  required: false,
});

/**
 * Berkas jawaban mahasiswa — WAJIB, batas dari `MAX_SUBMISSION_SIZE_MB`
 * (FR-019, BR-008).
 */
export const uploadSubmission = createDocumentUploader({
  field: 'file',
  maxSize: STORAGE.DOC_MAX_SIZE,
  label: 'jawaban tugas',
  required: true,
});

/**
 * Susun pesan penolakan ekstensi sesuai kebijakan efektif.
 *
 * Ketika kebijakan masih berupa default BR-007, pesan dipertahankan persis
 * seperti sebelumnya agar kontrak tes MVP 1–3 tidak berubah.
 */
function formatAllowedExtensionsMessage(allowedExtensions) {
  const defaults = STORAGE.DOC_ALLOWED_EXTENSIONS;
  const isDefault =
    allowedExtensions.length === defaults.length &&
    defaults.every((ext, index) => allowedExtensions[index] === ext);

  if (isDefault) {
    return 'Format berkas tidak didukung. Harap unggah file berformat .pdf, .docx, .xlsx, atau .zip';
  }
  return `Format berkas tidak didukung. Harap unggah file berformat ${allowedExtensions.join(', ')}`;
}

/**
 * Middleware penegakan kebijakan unggahan dari konfigurasi Admin (FR-049).
 *
 * Dipasang SETELAH middleware multer (memory storage) sehingga berkas yang
 * ditolak tidak pernah tertulis ke disk. Multer menegakkan hard ceiling
 * statis (10MB + whitelist superset); middleware ini menegakkan kebijakan
 * efektif dari `system_configs`:
 *   - ekstensi harus termasuk `file.allowed_extensions`;
 *   - ukuran tidak boleh melebihi `file.max_size_mb`.
 *
 * @param {object} [options]
 * @param {string} [options.kind='document'] label kebijakan (untuk log)
 * @returns {import('express').RequestHandler}
 */
export function enforceConfiguredUploadPolicy({ kind = 'document' } = {}) {
  return async function configuredUploadPolicy(req, res, next) {
    try {
      if (!req.file) {
        return next();
      }

      const policy = await ConfigService.getFilePolicy();
      const ext = getFileExtension(req.file.originalname);

      if (!policy.allowedExtensions.includes(ext)) {
        return next(new AppError(formatAllowedExtensionsMessage(policy.allowedExtensions), 400));
      }

      if (req.file.size > policy.maxSizeBytes) {
        return next(
          new AppError(
            `Ukuran berkas melebihi batas maksimal (maks ${policy.maxSizeMb}MB)`,
            400
          )
        );
      }

      return next();
    } catch (error) {
      console.error(`[upload.middleware] Gagal menerapkan kebijakan unggahan (${kind}):`, error.message);
      return next(error);
    }
  };
}
