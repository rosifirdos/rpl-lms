/**
 * KRS State Machine & Error Codes (SRS Bab 6.1, Bab 33, FR-022 s/d FR-035)
 *
 * Sumber kebenaran transisi legal KRS berada di server (bukan di UI) agar
 * transisi ilegal selalu ditolak terlepas dari klien yang mengaksesnya.
 */

// Transisi legal status KRS (SRS FR-024 s/d FR-030)
export const KRS_TRANSITIONS = {
  DRAFT: ['DIAJUKAN'],
  DIAJUKAN: ['DISETUJUI', 'DIKEMBALIKAN'],
  DISETUJUI: [], // status final — tidak ada transisi keluar reguler
  DIKEMBALIKAN: ['DIAJUKAN'], // resubmit setelah revisi (FR-030)
};

// Status yang masih memungkinkan mahasiswa menyunting detail KRS-nya
export const KRS_EDITABLE_STATES = ['DRAFT', 'DIKEMBALIKAN'];

// Status yang dihitung sebagai "kursi terisi" untuk cek kapasitas kelas
export const KRS_ENROLLED_STATUSES = ['DIAJUKAN', 'DISETUJUI'];

// Kode error standar validasi KRS (format SRS Bab 4.7 — alasan terstruktur)
export const KRS_ERROR_CODES = {
  PERIODE_TIDAK_AKTIF: 'PERIODE_TIDAK_AKTIF',
  PERIODE_BELUM_BUKA: 'PERIODE_BELUM_BUKA',
  PERIODE_SUDAH_TUTUP: 'PERIODE_SUDAH_TUTUP',
  KRS_TIDAK_DAPAT_DIUBAH: 'KRS_TIDAK_DAPAT_DIUBAH',
  KELAS_TIDAK_TERSEDIA: 'KELAS_TIDAK_TERSEDIA',
  KELAS_DI_LUR_PRODI: 'KELAS_DI_LUAR_PRODI',
  SEMESTER_PAKET_TIDAK_SESUAI: 'SEMESTER_PAKET_TIDAK_SESUAI',
  KELAS_SUDAH_DIAMBIL: 'KELAS_SUDAH_DIAMBIL',
  KELAS_PENUH: 'KELAS_PENUH',
  SKS_MELEBIHI_BATAS: 'SKS_MELEBIHI_BATAS',
  JAM_BENTROK: 'JAM_BENTROK',
  KRS_KOSONG: 'KRS_KOSONG',
  TRANSISI_TIDAK_LEGAL: 'TRANSISI_TIDAK_LEGAL',
  KONFLIK_KONKURENSI: 'KONFLIK_KONKURENSI',
  KRS_TIDAK_DITEMUKAN: 'KRS_TIDAK_DITEMUKAN',
  BUKAN_MAHASISWA: 'BUKAN_MAHASISWA',
  BUKAN_PA_PEMILIK: 'BUKAN_PA_PEMILIK',
};

/**
 * Cek apakah transisi status legal menurut state machine.
 * @param {string} from - status asal
 * @param {string} to - status tujuan
 * @returns {boolean}
 */
export function isLegalTransition(from, to) {
  const allowed = KRS_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

/**
 * Pesan standar untuk transisi ilegal.
 * @param {string} from
 * @param {string} to
 * @returns {string}
 */
export function illegalTransitionMessage(from, to) {
  return `Transisi status KRS dari ${from} ke ${to} tidak legal`;
}
