import nodemailer from 'nodemailer';
import { MAIL } from '../config/env.js';

/**
 * Layanan pengiriman email E-Learning Kampus (FR-003).
 *
 * Transport ditentukan oleh `MAIL_TRANSPORT`:
 *   - `smtp`   : kirim melalui SMTP (produksi).
 *   - `log`    : tulis isi email ke console (development tanpa SMTP).
 *   - `memory` : simpan ke outbox in-memory — HANYA untuk pengujian.
 *
 * Outbox in-memory (`getMailOutbox`) adalah fasilitas pengujian: suite dapat
 * membaca email yang "terkirim" untuk mengekstrak tautan reset kata sandi
 * tanpa memerlukan SMTP sungguhan. Pada `NODE_ENV=test` transport otomatis
 * dipaksa `memory` oleh `src/config/env.js`.
 */

/** Outbox in-memory untuk transport `memory` (pengujian). */
const memoryOutbox = [];

/** Transport SMTP yang di-lazy-create agar koneksi tidak dibuka saat tidak dipakai. */
let smtpTransport = null;

function getSmtpTransport() {
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: MAIL.SMTP_HOST,
      port: MAIL.SMTP_PORT,
      secure: MAIL.SMTP_SECURE,
      auth: MAIL.SMTP_USER
        ? {
            user: MAIL.SMTP_USER,
            pass: MAIL.SMTP_PASS,
          }
        : undefined,
    });
  }
  return smtpTransport;
}

/**
 * Kirim email melalui transport aktif.
 *
 * @param {object} params
 * @param {string} params.to alamat email penerima
 * @param {string} params.subject subjek email
 * @param {string} params.text isi email versi teks polos
 * @param {string} [params.html] isi email versi HTML (opsional)
 * @returns {Promise<{transport: string, to: string}>} info pengiriman
 */
export async function sendMail({ to, subject, text, html }) {
  const envelope = { from: MAIL.FROM, to, subject, text, html };

  switch (MAIL.TRANSPORT) {
    case 'smtp': {
      await getSmtpTransport().sendMail(envelope);
      break;
    }
    case 'memory': {
      memoryOutbox.push({
        from: envelope.from,
        to,
        subject,
        text,
        html,
        sent_at: new Date().toISOString(),
      });
      break;
    }
    case 'log':
    default: {
      // Transport log: tulis ke console agar terlihat pada output server dev.
      console.info(
        [
          '[mailer] EMAIL (transport=log)',
          `  To     : ${to}`,
          `  Subject: ${subject}`,
          `  ---`,
          text,
        ].join('\n')
      );
      break;
    }
  }

  return { transport: MAIL.TRANSPORT, to };
}

/**
 * Ambil salinan outbox in-memory (fasilitas pengujian).
 *
 * @returns {Array<object>} salinan entri email yang "terkirim" pada transport memory
 */
export function getMailOutbox() {
  return [...memoryOutbox];
}

/**
 * Kosongkan outbox in-memory (fasilitas pengujian, dipanggil pada teardown suite).
 */
export function clearMailOutbox() {
  memoryOutbox.length = 0;
}
