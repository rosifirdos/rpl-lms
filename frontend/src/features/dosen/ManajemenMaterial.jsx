import React, { useState, useEffect, useRef } from 'react';
import AppShell from '../../components/AppShell';

/**
 * ManajemenMaterial — Feature Component
 *
 * Pengelolaan berkas pembelajaran terproteksi sesuai aturan Enclave BR-009 &
 * NFR-005:
 * - Daftar modul & berkas materi ajar (baca, unduh, hapus)
 * - Status unduhan terproteksi (SHA-256 token session)
 * - Penanganan akses ditolak (HTTP 403 — RBAC-LOCK)
 * - Jejak audit keamanan dokumen (Audit Trail) real-time
 * - Ringkasan kepatuhan kebijakan enrolment & enkripsi
 */

const COURSE_CONTEXT = {
  code: 'TIF-301',
  name: 'Rekayasa Perangkat Lunak',
  classGroup: 'TI-A',
  sks: 3,
  lecturer: 'Dr. Bayu Pratama, M.Kom.',
  nidn: '0612345601',
  room: 'Lab RPL 3.02 & SPADA Hybrid',
  meeting: 'Pertemuan 3 — Analisis Kebutuhan Sistem & Spesifikasi SRS IEEE 830',
  quotaUsed: 42,
  quotaTotal: 45,
};

const INITIAL_MATERIALS = [
  {
    id: 'mat-1',
    name: 'Slide Presentasi — Software Requirements Spec.pptx',
    icon: 'slideshow',
    size: '4.8 MB',
    visibility: 'Publik',
    updatedAt: '12 Mar 2026, 09:15 WIB',
    downloads: 38,
  },
  {
    id: 'mat-2',
    name: 'Modul 3 — Analisis Kebutuhan IEEE 830.pdf',
    icon: 'picture_as_pdf',
    size: '1.2 MB',
    visibility: 'Terproteksi',
    updatedAt: '06 Okt 2026, 08:40 WIB',
    downloads: 21,
  },
  {
    id: 'mat-3',
    name: 'Template Dokumen SRS — IEEE Std 830-1998.docx',
    icon: 'description',
    size: '640 KB',
    visibility: 'Format Standar',
    updatedAt: '06 Okt 2026, 07:12 WIB',
    downloads: 17,
  },
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'log-1',
    time: '08:29:12',
    message: 'Token handshake 0x9AF83B diverifikasi untuk Dr. Bayu Pratama (Dosen).',
    status: 'SUCCESS (200)',
    statusColor: 'text-tertiary',
  },
  {
    id: 'log-2',
    time: '08:27:04',
    message: 'Mahasiswa NIM 23670014 ditolak mengunduh berkas materi privat.',
    status: 'FORBIDDEN (403)',
    statusColor: 'text-error',
  },
  {
    id: 'log-3',
    time: '08:14:50',
    message: "Berkas 'Modul 3 — Analisis Kebutuhan Sistem' ditandai untuk penghapusan.",
    status: 'PENDING CONFIRM',
    statusColor: 'text-secondary',
  },
];

export default function ManajemenMaterial({ onNavigate, onRoleChange }) {
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const toastTimeoutRef = useRef(null);
  const deleteTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(toastTimeoutRef.current);
      clearTimeout(deleteTimeoutRef.current);
    };
  }, []);

  // Tutup dialog hapus dengan tombol Escape.
  useEffect(() => {
    if (!deleteTarget) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setDeleteTarget(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteTarget]);

  const showToast = (message, type = 'info') => {
    clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3200);
  };

  const handleDeleteConfirm = () => {
    const target = deleteTarget;
    if (!target) return;
    setIsDeleting(true);
    clearTimeout(deleteTimeoutRef.current);
    deleteTimeoutRef.current = setTimeout(() => {
      setIsDeleting(false);
      setDeleteTarget(null);
      setMaterials((prev) => prev.filter((material) => material.id !== target.id));
      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString('id-ID'),
          message: `Berkas '${target.name}' dihapus permanen oleh Dosen Pengampu.`,
          status: 'DELETED (204)',
          statusColor: 'text-error',
        },
        ...prev,
      ]);
      showToast(`Materi '${target.name}' berhasil dihapus permanen. Jejak audit telah dicatat.`, 'success');
    }, 600);
  };

  return (
    <AppShell
      activeRole="dosen"
      onRoleChange={onRoleChange}
      activeNavPath="manajemen-materi"
      onNavChange={onNavigate}
    >
      <div className="flex flex-col w-full max-w-7xl mx-auto space-y-space-lg">
        {/* Toast Notification */}
        {toast.visible && (
          <div className="fixed top-5 right-5 z-[9999]" role="status" aria-live="polite">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
                toast.type === 'success'
                  ? 'bg-tertiary-container text-on-tertiary-container border-tertiary/40'
                  : 'bg-surface-container-highest text-on-surface border-outline/30'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {toast.type === 'success' ? 'check_circle' : 'info'}
              </span>
              <span className="font-label-md text-label-md">{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
                aria-label="Tutup notifikasi"
                className="p-1 rounded hover:opacity-75"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumbs & Page Title */}
        <div className="flex flex-col gap-space-xs">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-space-xs font-caption text-caption text-outline"
          >
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('dasbor-dosen')}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">school</span>
              <span>Dasbor Dosen</span>
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('kelas-diampu')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Kelas Diampu
            </button>
            <span>/</span>
            <span className="text-on-surface font-label-sm font-semibold">
              {COURSE_CONTEXT.name} ({COURSE_CONTEXT.classGroup})
            </span>
          </nav>
          <div className="flex items-center gap-space-md mt-1 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Manajemen Berkas &amp; Akses Terproteksi
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-caption text-caption">
              <span className="material-symbols-outlined text-[14px] text-tertiary">verified_user</span>
              <span>LMS Enclave BR-009 / NFR-005</span>
            </span>
          </div>
        </div>

        {/* Course Context Overview Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-space-lg shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
            <div className="space-y-space-xs max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-caption font-bold tracking-wider uppercase bg-secondary-container text-on-secondary-container">
                  Kode: {COURSE_CONTEXT.code}
                </span>
                <span className="text-caption text-secondary font-caption">
                  SKS: {COURSE_CONTEXT.sks} (Reguler Pagi)
                </span>
                <span className="text-caption text-outline font-caption">•</span>
                <span className="text-caption text-on-surface-variant font-caption">
                  {COURSE_CONTEXT.room}
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                {COURSE_CONTEXT.name} — Kelas {COURSE_CONTEXT.classGroup}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Topik Pembahasan:{' '}
                <span className="text-on-surface font-label-md font-semibold">
                  {COURSE_CONTEXT.meeting}
                </span>
                . Semua berkas pembelajaran dilindungi token sesi terenkripsi SHA-256 untuk
                memenuhi regulasi integritas konten digital universitas.
              </p>
            </div>
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-space-xs shrink-0 bg-surface-container-high/60 p-space-md rounded-xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping" />
                <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                  Enrolment Guard: Aktif
                </span>
              </div>
              <div className="font-caption text-caption text-on-surface-variant">
                Dosen: <strong className="text-on-surface">{COURSE_CONTEXT.lecturer}</strong>
              </div>
              <div className="font-caption text-caption text-outline">
                NIDN: {COURSE_CONTEXT.nidn} • Kuota Mahasiswa: {COURSE_CONTEXT.quotaUsed}/
                {COURSE_CONTEXT.quotaTotal}
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Left Column: Material List */}
          <div className="xl:col-span-8 space-y-space-lg">
            <div className="rounded-2xl bg-surface-container p-space-lg shadow-sm space-y-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-surface-container-high/60">
                <div className="flex items-center gap-space-sm">
                  <span className="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center font-headline-md text-title-md font-bold">
                    03
                  </span>
                  <div>
                    <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                      Daftar Modul &amp; Berkas Materi Ajar
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Kelola izin baca, unduh, dan kepemilikan materi pembelajaran.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('unggah-materi')}
                  className="px-3 py-1.5 rounded-lg bg-primary-container/20 hover:bg-primary-container/30 text-primary font-label-sm text-label-sm flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  <span>Unggah Materi</span>
                </button>
              </div>

              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container-high/50 transition-colors gap-space-md"
                >
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[26px]">{material.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-title-md text-title-md text-on-surface truncate font-semibold">
                          {material.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-caption bg-surface-container-highest text-tertiary">
                          {material.visibility}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-space-sm font-caption text-caption text-outline mt-0.5">
                        <span>Ukuran: {material.size}</span>
                        <span>•</span>
                        <span>Diperbarui: {material.updatedAt}</span>
                        <span>•</span>
                        <span className="text-secondary">
                          {material.downloads} Mahasiswa Mengunduh
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => showToast(`Membuka pratinjau berkas ${material.name}...`)}
                      aria-label={`Pratinjau ${material.name}`}
                      title="Pratinjau Materi"
                      className="p-2 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(material)}
                      aria-label={`Hapus ${material.name}`}
                      title="Hapus Berkas"
                      className="p-2 rounded-lg bg-surface-container-highest hover:bg-error/20 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {materials.length === 0 && (
                <div className="rounded-xl bg-surface-container-lowest p-10 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-[48px] text-outline mb-2">
                    folder_off
                  </span>
                  <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                    Belum Ada Materi Pembelajaran
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Unggah modul pertama untuk mata kuliah ini.
                  </p>
                </div>
              )}

              {/* Secure download status */}
              <div className="rounded-xl p-space-md bg-surface-container-low text-on-surface shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                  <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[26px]">shield_lock</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-title-md text-title-md text-on-surface font-semibold truncate block">
                        Unduhan Terproteksi Aktif
                      </span>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-tertiary-container/20 text-tertiary">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          SHA-256 Token Session Verified
                        </span>
                        <span className="text-caption text-outline hidden md:inline">
                          • Tautan unduh tidak pernah ditampilkan publik
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-caption font-label-sm bg-surface-container-high text-on-surface-variant shrink-0">
                    <span className="material-symbols-outlined text-[15px] text-primary">lock</span>
                    <span>Terkunci ke NIDN: {COURSE_CONTEXT.nidn}</span>
                  </span>
                </div>
              </div>

              {/* 403 Forbidden — access denied state */}
              <div className="rounded-xl p-space-md bg-error-container/20 text-on-error-container shadow-sm border border-error/20">
                <div className="flex flex-col md:flex-row items-start gap-space-md">
                  <div className="w-11 h-11 rounded-full bg-error-container/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-error text-[24px]">gpp_bad</span>
                  </div>
                  <div className="flex-1 space-y-space-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-title-md text-title-md font-semibold text-error flex items-center gap-2">
                        <span>Akses Unduhan Ditolak (HTTP 403 Forbidden)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-error-container/50 text-on-error-container">
                          RBAC-LOCK
                        </span>
                      </h4>
                      <span className="font-caption text-caption text-on-error-container/80 font-mono">
                        Kode Insiden: #SEC-403-DirectEnrol
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-error-container leading-relaxed">
                      Akun tidak terdaftar pada kelas ini (
                      <strong className="underline">Direct Enrollment Admin required</strong>),
                      sehingga berkas materi privat ini tidak dapat diunduh (sesuai protokol
                      integritas{' '}
                      <code className="bg-error-container/40 px-1 py-0.5 rounded text-xs font-mono font-bold">
                        BR-009 &amp; NFR-005
                      </code>
                      ).
                    </p>
                    <div className="flex flex-wrap items-center gap-space-md pt-2">
                      <button
                        type="button"
                        onClick={() => onNavigate && onNavigate('dasbor-dosen')}
                        className="px-4 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Kembali ke Dasbor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast('Menghubungi Tim Dukungan BAAK UPGRIS...')}
                        className="font-label-md text-label-md text-error hover:text-on-error-container underline flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">support_agent</span>
                        <span>Hubungi BAAK / Admin Pusat LMS</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Log Panel */}
            <div className="rounded-2xl bg-surface-container-low p-space-md space-y-space-sm shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
                  <span className="font-title-md text-title-md text-on-surface font-bold">
                    Jejak Audit Keamanan Dokumen (Audit Trail)
                  </span>
                </div>
                <span className="text-caption text-tertiary font-caption flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                  Sinkronisasi Realtime
                </span>
              </div>
              <div className="divide-y divide-surface-container-high/40 text-caption text-on-surface-variant">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2 flex items-center justify-between gap-3">
                    <span className="font-mono text-outline min-w-0 truncate">
                      [{log.time}] {log.message}
                    </span>
                    <span className={`font-semibold shrink-0 ${log.statusColor}`}>{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Security Policy */}
          <div className="xl:col-span-4 space-y-space-lg">
            <div className="rounded-2xl bg-surface-container p-space-lg shadow-sm space-y-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">shield_with_heart</span>
                </div>
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">
                    Validasi Akses Berkas
                  </h4>
                  <p className="font-caption text-caption text-outline">
                    Protokol Keamanan SPADA UPGRIS
                  </p>
                </div>
              </div>
              <div className="p-space-md rounded-xl bg-surface-container-low space-y-space-sm">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant font-body-sm">Kepatuhan RBAC:</span>
                  <span className="text-tertiary font-label-sm font-semibold">
                    Tingkat Enkripsi 2
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant font-body-sm">Aturan BR-009:</span>
                  <span className="text-on-surface font-label-sm font-semibold">
                    Enrolment Ketat
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant font-body-sm">Aturan NFR-005:</span>
                  <span className="text-on-surface font-label-sm font-semibold">
                    In-Flight Hash Check
                  </span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant font-body-sm">Masa Sesi Unduh:</span>
                  <span className="text-secondary font-label-sm font-semibold">15 Menit Aktif</span>
                </div>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-high/40 text-caption text-outline space-y-1">
                <div className="font-semibold text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-primary">info</span>
                  Catatan Dosen Pengampu:
                </div>
                <p className="leading-relaxed">
                  Menghapus materi pembelajaran yang telah memiliki riwayat unduhan mahasiswa akan
                  memicu notifikasi peringatan ke dasbor BAAK.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog Konfirmasi Hapus */}
        {deleteTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-hapus-title"
              aria-describedby="dialog-hapus-desc"
              className="relative w-full max-w-[480px] bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl p-[24px] text-left"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                aria-label="Tutup dialog"
                title="Tutup Dialog"
                className="absolute top-4 right-4 text-outline hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="flex flex-col gap-space-md">
                <div className="w-12 h-12 rounded-full bg-error-container/40 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-error text-[26px]">delete</span>
                </div>

                <div className="space-y-1.5">
                  <h3
                    id="dialog-hapus-title"
                    className="text-[18px] font-semibold text-on-surface leading-snug"
                  >
                    Hapus Materi Pembelajaran?
                  </h3>
                  <p id="dialog-hapus-desc" className="text-[14px] text-on-surface-variant leading-relaxed">
                    Materi <strong className="text-on-surface font-medium">'{deleteTarget.name}'</strong>{' '}
                    akan dihapus permanen dan tidak dapat diakses lagi oleh mahasiswa yang terdaftar.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-error-container/20 text-on-error-container">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                    warning
                  </span>
                  <p className="text-[12px] leading-relaxed font-medium">
                    Tindakan ini tidak dapat dibatalkan. Riwayat audit akan mencatat penghapusan
                    berkas ini sesuai regulasi SPADA UPGRIS.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-transparent hover:bg-surface-container text-on-surface-variant font-medium text-[14px] transition-colors text-center cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-error hover:opacity-90 text-on-error font-medium text-[14px] flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center cursor-pointer disabled:opacity-60"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isDeleting ? 'animate-spin' : ''
                      }`}
                    >
                      {isDeleting ? 'refresh' : 'delete'}
                    </span>
                    <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Materi'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}