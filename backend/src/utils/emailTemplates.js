import { PASSWORD_RESET_TTL_MINUTES, FRONTEND_URL } from '../config/env.js';

/**
 * Template email E-Learning Kampus.
 *
 * Seluruh template berbahasa Indonesia dan tidak pernah menyertakan data
 * sensitif selain tautan aksi itu sendiri (mis. token reset tidak pernah
 * ditulis ulang di badan audit/log).
 */

/**
 * Template email permintaan reset kata sandi (FR-003).
 *
 * @param {object} params
 * @param {string} params.recipientName nama tampilan penerima (boleh kosong)
 * @param {string} params.resetUrl tautan lengkap halaman reset kata sandi frontend
 * @param {Date} params.expiresAt batas waktu kedaluwarsa token
 * @returns {{subject: string, text: string, html: string}}
 */
export function buildPasswordResetEmail({ recipientName, resetUrl, expiresAt }) {
  const name = recipientName && recipientName.trim() ? recipientName.trim() : 'Pengguna';
  const expiryLabel = expiresAt.toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const text = [
    `Halo ${name},`,
    '',
    'Kami menerima permintaan pemulihan kata sandi untuk akun Anda di E-Learning Kampus.',
    'Klik tautan berikut untuk membuat kata sandi baru:',
    '',
    resetUrl,
    '',
    `Tautan ini berlaku hingga ${expiryLabel} (${PASSWORD_RESET_TTL_MINUTES} menit) dan hanya dapat digunakan satu kali.`,
    'Jika Anda tidak merasa meminta pemulihan kata sandi, abaikan email ini — kata sandi Anda tidak diubah.',
    '',
    'Salam,',
    'Tim E-Learning Kampus',
  ].join('\n');

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">',
    `  <h2 style="margin-bottom:12px;">Reset Kata Sandi — E-Learning Kampus</h2>`,
    `  <p>Halo ${name},</p>`,
    '  <p>Kami menerima permintaan pemulihan kata sandi untuk akun Anda. Klik tombol berikut untuk membuat kata sandi baru:</p>',
    `  <p style="margin:24px 0;"><a href="${resetUrl}" style="background:#2563eb;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Buat Kata Sandi Baru</a></p>`,
    `  <p>Atau salin tautan berikut ke peramban Anda:</p>`,
    `  <p style="word-break:break-all;"><code>${resetUrl}</code></p>`,
    `  <p>Tautan ini berlaku hingga <strong>${expiryLabel}</strong> (${PASSWORD_RESET_TTL_MINUTES} menit) dan hanya dapat digunakan satu kali.</p>`,
    '  <p>Jika Anda tidak merasa meminta pemulihan kata sandi, abaikan email ini — kata sandi Anda tidak diubah.</p>',
    '  <p style="margin-top:24px;">Salam,<br/>Tim E-Learning Kampus</p>',
    `  <p style="font-size:12px;color:#6b7280;">Email ini dikirim otomatis oleh sistem E-Learning Kampus (${FRONTEND_URL}).</p>`,
    '</div>',
  ].join('\n');

  return {
    subject: 'Reset Kata Sandi — E-Learning Kampus',
    text,
    html,
  };
}
