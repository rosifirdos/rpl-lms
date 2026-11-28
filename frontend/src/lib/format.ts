/**
 * lib/format.ts
 *
 * Utilitas format tanggal & angka locale `id-ID` (Bab 3.8):
 * - Semua tampilan waktu memakai `date-fns` + locale `id`.
 * - Waktu ditampilkan mengikuti zona perangkat dengan label zona.
 * - `toIsoOffset` mengonversi waktu lokal → ISO 8601 ber-offset
 *   (mis. `2026-11-28T14:30:00+07:00`) untuk payload form.
 */

import { format, formatDistanceToNowStrict, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';

function toDate(value: Date | string | number): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : null;
  }
  const date = new Date(value);
  return isValid(date) ? date : null;
}

/** Format tanggal, mis. "28 November 2026". */
export function formatDate(value: Date | string | number, pattern = 'd MMMM yyyy'): string {
  const date = toDate(value);
  return date ? format(date, pattern, { locale: id }) : '—';
}

/** Format tanggal + jam, mis. "28 Nov 2026, 14.30". */
export function formatDateTime(value: Date | string | number): string {
  return formatDate(value, "d MMM yyyy, HH.mm");
}

/** Format jam saja, mis. "14.30". */
export function formatTime(value: Date | string | number): string {
  return formatDate(value, 'HH.mm');
}

/** Format tanggal dengan label zona perangkat, mis. "28 Nov 2026, 14.30 (GMT+7)". */
export function formatDateTimeWithZone(value: Date | string | number): string {
  const date = toDate(value);
  if (!date) return '—';
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
  const minutes = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
  return `${formatDateTime(date)} (GMT${sign}${hours}${minutes})`;
}

/** Waktu relatif berbahasa Indonesia, mis. "3 menit yang lalu". */
export function formatRelative(value: Date | string | number): string {
  const date = toDate(value);
  return date
    ? formatDistanceToNowStrict(date, { addSuffix: true, locale: id })
    : '—';
}

/** Angka locale id-ID, mis. 1234 → "1.234". */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('id-ID', options).format(value);
}

/**
 * Konversi Date lokal → string ISO 8601 ber-offset (bukan UTC `Z`)
 * agar backend menerima waktu dengan zona pengirim.
 */
export function toIsoOffset(date: Date = new Date()): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const tzHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
  const tzMinutes = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
  const local = new Date(date.getTime() - offsetMinutes * 60_000);
  return `${local.toISOString().slice(0, 19)}${sign}${tzHours}:${tzMinutes}`;
}
