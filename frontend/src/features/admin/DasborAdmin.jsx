import React, { useState, useEffect } from 'react';
import AppShell from '../../components/AppShell';
import { adminApi } from '../../services/api';

/**
 * DasborAdmin — Feature Component
 *
 * Implementasi React untuk Dasbor Administrator SPADA LMS UPGRIS.
 * Memanfaatkan AppShell tunggal terpadu dengan penegakan RBAC.
 * Pengelolaan terpusat Master Data, Direct Enrollment, Rekap Audit Trail,
 * dan Pemantauan Integritas Sistem (Storage, MIME Whitelist, Gatekeeping Presensi).
 */
export default function DasborAdmin({ onRoleChange }) {
  const [activeNavPath, setActiveNavPath] = useState('manajemen-pengguna');
  const [toastMessage, setToastMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [filterAction, setFilterAction] = useState('ALL');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const metricCards = [
    {
      id: 'users',
      title: 'Total Pengguna Terdaftar',
      value: '1,420',
      badge: '1,350 Mahasiswa • 70 Dosen',
      subtext: '+45 pendaftar semester ini',
      subIcon: 'arrow_upward',
      subColor: 'text-tertiary',
      rightText: '2 Admin Aktif',
      icon: 'groups',
      iconBg: 'bg-primary-container/20 text-primary',
    },
    {
      id: 'courses',
      title: 'Total Mata Kuliah',
      value: '48 MK',
      badge: 'Kurikulum Terakreditasi (144 SKS)',
      subtext: '100% Silabus 16 Sesi',
      subIcon: 'verified',
      subColor: 'text-tertiary',
      rightText: 'Terkonfigurasi',
      icon: 'menu_book',
      iconBg: 'bg-secondary-container/20 text-secondary',
    },
    {
      id: 'classes',
      title: 'Kelas Perkuliahan',
      value: '36 Kelas',
      badge: 'Semester Ganjil 2026/2027',
      subtext: 'Seluruh Dosen Ditugaskan',
      subIcon: 'done_all',
      subColor: 'text-tertiary',
      rightText: '36/36 Lengkap',
      icon: 'co_present',
      iconBg: 'bg-surface-container-high text-primary',
    },
    {
      id: 'enrollment',
      title: 'Total Direct Enrollment',
      value: '1,280',
      badge: 'Bebas Rebutan Kuota Manual',
      subtext: '100% Selesai Sinkronisasi',
      subIcon: 'check_circle',
      subColor: 'text-tertiary',
      rightText: 'Otomatis PTIK',
      icon: 'how_to_reg',
      iconBg: 'bg-tertiary-container/20 text-tertiary',
    },
  ];

  const shortcuts = [
    {
      id: 'user',
      title: 'Tambah Pengguna Baru',
      desc: 'Daftarkan Akun Mahasiswa, Dosen Pengampu, atau Staf Admin PTIK.',
      icon: 'person_add',
      color: 'text-primary',
      action: 'Buka Formulir',
      onClick: () => {
        setModalType('USER');
        setModalOpen(true);
      },
    },
    {
      id: 'course',
      title: 'Buat Mata Kuliah Baru',
      desc: 'Definisikan Kode MK, Nama, Bobot SKS, & Kurikulum Prodi.',
      icon: 'library_add',
      color: 'text-secondary',
      action: 'Buat Master Data',
      onClick: () => {
        setModalType('COURSE');
        setModalOpen(true);
      },
    },
    {
      id: 'class',
      title: 'Buka Kelas Perkuliahan',
      desc: 'Buka Kelas Semester, Tentukan Kuota, & Tugaskan Dosen Pengampu.',
      icon: 'post_add',
      color: 'text-tertiary',
      action: 'Jadwalkan Kelas',
      onClick: () => {
        setModalType('CLASS');
        setModalOpen(true);
      },
    },
    {
      id: 'enrollment',
      title: 'Enrollment Massal Mahasiswa',
      desc: 'Masukkan Mahasiswa ke Kelas secara Kolektif via Direct Enrollment.',
      icon: 'group_add',
      color: 'text-error',
      action: 'Enroll Massal',
      highlight: true,
      onClick: () => {
        setModalType('ENROLL');
        setModalOpen(true);
      },
    },
  ];

  const auditLogs = [
    {
      id: 'log-1',
      timestamp: '2026-10-29 08:24:12',
      actor: 'Admin PTIK (admin@upgris.ac.id)',
      actorSub: 'NIP: 19880101 • Super Administrator',
      actionType: 'ENROLLMENT',
      actionBadgeClass: 'bg-tertiary-container/30 text-tertiary',
      dotColor: 'bg-tertiary',
      entity: 'Kelas: Rekayasa Perangkat Lunak 3A',
      detail: 'Direct enrollment 42 mahasiswa baru dari Angkatan 2024 via bulk CSV',
      ip: '10.10.4.12',
    },
    {
      id: 'log-2',
      timestamp: '2026-10-29 07:58:30',
      actor: 'Dr. Awan Rosi, M.Kom.',
      actorSub: 'NIDN: 0612345601 • Dosen',
      actionType: 'GRADE_MUTATION',
      actionBadgeClass: 'bg-primary-container/30 text-primary',
      dotColor: 'bg-primary',
      entity: 'Tugas 01 • Pemrograman Web',
      detail: 'Penilaian 38 berkas tugas mahasiswa, rata-rata skor 86.40',
      ip: '192.168.1.104',
    },
    {
      id: 'log-3',
      timestamp: '2026-10-28 16:15:00',
      actor: 'Admin PTIK (admin@upgris.ac.id)',
      actorSub: 'NIP: 19880101 • Super Administrator',
      actionType: 'CONFIG_CHANGE',
      actionBadgeClass: 'bg-secondary-container/30 text-secondary',
      dotColor: 'bg-secondary',
      entity: 'Konfigurasi Gatekeeping Presensi',
      detail: 'Ambang batas kehadiran ujian ditetapkan minimal 70.0% (12 dari 16 sesi)',
      ip: '10.10.4.12',
    },
    {
      id: 'log-4',
      timestamp: '2026-10-28 14:02:19',
      actor: 'Ir. Nina Kartika, M.T.',
      actorSub: 'NIDN: 0628047702 • Dosen',
      actionType: 'GRADE_MUTATION',
      actionBadgeClass: 'bg-primary-container/30 text-primary',
      dotColor: 'bg-primary',
      entity: 'Presensi Sesi 4 • Basis Data',
      detail: 'Tutup manual sesi presensi mahasiswa (41 hadir, 1 sakit)',
      ip: '192.168.1.55',
    },
    {
      id: 'log-5',
      timestamp: '2026-10-28 11:20:44',
      actor: 'Admin PTIK (admin@upgris.ac.id)',
      actorSub: 'NIP: 19880101 • Super Administrator',
      actionType: 'ENROLLMENT',
      actionBadgeClass: 'bg-tertiary-container/30 text-tertiary',
      dotColor: 'bg-tertiary',
      entity: 'Kelas: Kecerdasan Buatan 5B',
      detail: 'Penambahan 3 mahasiswa pindahan lintas program studi',
      ip: '10.10.4.12',
    },
  ];

  const filteredLogs = filterAction === 'ALL'
    ? auditLogs
    : auditLogs.filter((log) => log.actionType === filterAction);

  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath={activeNavPath}
      onNavChange={setActiveNavPath}
    >
      {/* Toast Notification Lokal */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30 animate-bounce"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      {/* ── MODAL OPERASIONAL ADMINISTRATOR ── */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                  <span className="material-symbols-outlined text-[20px]">
                    {modalType === 'USER' && 'person_add'}
                    {modalType === 'COURSE' && 'library_add'}
                    {modalType === 'CLASS' && 'post_add'}
                    {modalType === 'ENROLL' && 'group_add'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">
                    {modalType === 'USER' && 'Tambah Pengguna Baru'}
                    {modalType === 'COURSE' && 'Buat Master Mata Kuliah'}
                    {modalType === 'CLASS' && 'Buka Kelas Perkuliahan Baru'}
                    {modalType === 'ENROLL' && 'Direct Enrollment Massal'}
                  </h3>
                  <p className="text-xs text-on-surface-variant">Konfigurasi data master &amp; sinkronisasi ke basis data</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {modalType === 'USER' && (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Nama Lengkap &amp; Gelar
                    </label>
                    <input
                      type="text"
                      placeholder="cth: Dr. Rina Setyawati, M.Kom."
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Peran (Role)
                      </label>
                      <select className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary">
                        <option value="MAHASISWA">Mahasiswa</option>
                        <option value="DOSEN">Dosen Pengampu</option>
                        <option value="ADMIN">Administrator PTIK</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        NIM / NIDN / NIP
                      </label>
                      <input
                        type="text"
                        placeholder="cth: 22670014"
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalType === 'COURSE' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Kode MK
                      </label>
                      <input
                        type="text"
                        placeholder="cth: INF308"
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Nama Mata Kuliah
                      </label>
                      <input
                        type="text"
                        placeholder="cth: Rekayasa Perangkat Lunak"
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Bobot SKS
                      </label>
                      <input
                        type="number"
                        defaultValue={3}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Program Studi
                      </label>
                      <select className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary">
                        <option>S1 Informatika</option>
                        <option>S1 Sistem Informasi</option>
                        <option>Pendidikan TIK</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {modalType === 'CLASS' && (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Pilih Master Mata Kuliah
                    </label>
                    <select className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary">
                      <option>INF308 - Rekayasa Perangkat Lunak (3 SKS)</option>
                      <option>INF312 - Pemrograman Web Berbasis Komponen (3 SKS)</option>
                      <option>INF204 - Basis Data Terdistribusi (3 SKS)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Nama Kelas
                      </label>
                      <input
                        type="text"
                        placeholder="cth: Kelas 3A Reguler"
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Dosen Pengampu
                      </label>
                      <select className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary">
                        <option>Dr. Awan Rosi, M.Kom.</option>
                        <option>Ir. Nina Kartika, M.T.</option>
                        <option>Dr. Supriyono, M.Kom.</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {modalType === 'ENROLL' && (
                <>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Pilih Kelas Sasaran
                    </label>
                    <select className="w-full mt-1 px-3 py-2 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary">
                      <option>Rekayasa Perangkat Lunak - Kelas 3A</option>
                      <option>Pemrograman Web - Kelas 3B</option>
                      <option>Basis Data - Kelas 2A</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Unggah File CSV / Excel Mahasiswa
                    </label>
                    <div className="border-2 border-dashed border-outline-variant/50 rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors">
                      <span className="material-symbols-outlined text-[32px] text-outline mb-1">upload_file</span>
                      <p className="text-xs text-on-surface font-medium">Klik untuk memilih berkas (.xlsx, .csv)</p>
                      <p className="text-[11px] text-outline">Format: Kolom NIM, Nama, Angkatan, Program Studi</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface text-sm font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  showToast('Operasi master berhasil diproses dan dicatat di Jejak Audit!');
                }}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary text-sm font-semibold transition-colors shadow-md"
              >
                Simpan &amp; Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 1: HEADER & STATUS BANNER ── */}
      <section className="relative w-full rounded-2xl bg-surface-container-low p-gutter overflow-hidden shadow-sm mb-space-lg border border-outline-variant/20">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-tertiary-container/20 border border-tertiary/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
            </span>
            <span className="font-caption text-caption font-bold tracking-wider text-tertiary uppercase">
              Portal Administrator Utama &bull; Kontrol Tunggal SPADA LMS
            </span>
          </div>
        </div>

        {/* Main Title Block & Quick Operations */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
          <div className="flex flex-col gap-1 max-w-3xl">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Dasbor Administrator SPADA LMS
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Semester Ganjil 2026/2027 &bull; Pengelolaan Terpusat Master Data, Direct Enrollment, dan Jejak Keamanan Sistem
            </p>
          </div>

          {/* Controls Block */}
          <div className="flex flex-wrap items-center gap-space-sm self-start xl:self-end">
            <div className="inline-flex items-center gap-space-xs px-3 py-2 rounded-lg bg-surface-container text-secondary font-label-sm text-label-sm shadow-sm border border-outline-variant/20">
              <span className="material-symbols-outlined text-[16px] text-secondary">admin_panel_settings</span>
              <span>Mode Peran: <strong className="text-on-surface">Admin Tunggal</strong></span>
            </div>

            <button
              onClick={() => {
                setModalType('USER');
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-space-xs px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-md hover:bg-primary-fixed hover:shadow-lg transition-all active:scale-[0.98]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Buat Master Kelas / User</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: 4 PRIMARY METRIC CARDS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metricCards.map((card) => (
          <div
            key={card.id}
            className="flex flex-col justify-between p-5 rounded-xl bg-surface-container shadow-md hover:shadow-lg transition-all group relative overflow-hidden border border-outline-variant/20"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-label-md text-label-md text-on-surface-variant font-medium">{card.title}</span>
                <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center transition-colors`}>
                  <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                </div>
              </div>
              <div className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold mb-1">
                {card.value}
              </div>
              <div className="inline-block px-2 py-0.5 rounded bg-surface-container-high font-caption text-caption mb-3 text-secondary font-medium">
                {card.badge}
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30 text-outline">
              <span className={`font-caption text-caption flex items-center gap-1 font-semibold ${card.subColor}`}>
                <span className="material-symbols-outlined text-[14px]">{card.subIcon}</span>
                {card.subtext}
              </span>
              <span className="font-caption text-caption text-on-surface-variant font-medium">{card.rightText}</span>
            </div>
          </div>
        ))}
      </section>

      {/* ── SECTION 3: QUICK OPERATIONAL SHORTCUTS (Bento Action Grid) ── */}
      <section className="flex flex-col gap-space-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">
            Pintasan Operasional Administrator
          </h2>
          <span className="font-caption text-caption text-on-surface-variant">
            Aksi cepat konfigurasi master data dan manajemen kepesertaan perkuliahan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {shortcuts.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={sc.onClick}
              className={`group flex flex-col justify-between p-5 rounded-xl transition-all shadow-sm text-left border border-outline-variant/20 ${
                sc.highlight
                  ? 'bg-surface-container-highest hover:bg-surface-bright shadow-md relative overflow-hidden'
                  : 'bg-surface-container-high hover:bg-surface-bright'
              }`}
            >
              {sc.highlight && (
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-tertiary/10 rounded-full blur-xl pointer-events-none" />
              )}
              <div className="flex flex-col gap-3">
                <div className={`w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center ${sc.color} group-hover:scale-105 transition-transform`}>
                  <span className="material-symbols-outlined text-[24px]">{sc.icon}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-title-md text-title-md text-on-surface font-semibold">
                      {sc.title}
                    </span>
                    {sc.highlight && (
                      <span className="px-1.5 py-0.5 rounded bg-tertiary text-on-tertiary font-caption text-caption font-bold">
                        Prioritas
                      </span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    {sc.desc}
                  </p>
                </div>
              </div>
              <div className={`pt-4 flex items-center gap-1 font-label-sm text-label-sm ${sc.color} font-bold`}>
                <span>{sc.action}</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: RECENT AUDIT TRAIL & SYSTEM MONITORING ── */}
      <section className="flex flex-col gap-space-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <h2 className="font-title-lg text-title-lg text-on-surface font-semibold">
              Jejak Audit Terkini (Recent Audit Trail)
            </h2>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-caption text-caption font-semibold">
              5 Entri Aktivitas Terakhir (Immutable Log)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter chips */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30">
              {['ALL', 'ENROLLMENT', 'GRADE_MUTATION', 'CONFIG_CHANGE'].map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setFilterAction(act)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    filterAction === act
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>

            <a
              className="font-label-sm text-label-sm text-primary hover:text-primary-fixed flex items-center gap-1"
              href="#audit-all"
              onClick={(e) => {
                e.preventDefault();
                showToast('Membuka audit trail lengkap (2,840 entri)');
              }}
            >
              <span>Seluruh Audit</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </a>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="w-full bg-surface-container rounded-xl shadow-md overflow-hidden border border-outline-variant/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest text-on-surface font-label-sm text-label-sm">
                  <th className="py-3 px-4 font-semibold tracking-wider">STEMPEL WAKTU</th>
                  <th className="py-3 px-4 font-semibold tracking-wider">PELAKU (ACTOR)</th>
                  <th className="py-3 px-4 font-semibold tracking-wider">JENIS AKSI</th>
                  <th className="py-3 px-4 font-semibold tracking-wider">ENTITAS SASARAN</th>
                  <th className="py-3 px-4 font-semibold tracking-wider">RINCIAN MODIFIKASI</th>
                  <th className="py-3 px-4 font-semibold tracking-wider text-right">STATUS KEAMANAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm text-on-surface">
                {filteredLogs.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container-high/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-on-surface-variant text-[12px]">
                      {row.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{row.actor}</span>
                        <span className="font-caption text-caption text-outline">{row.actorSub}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold ${row.actionBadgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${row.dotColor}`} />
                        {row.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-secondary">
                      {row.entity}
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant max-w-xs truncate" title={row.detail}>
                      {row.detail}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-tertiary">
                        <span className="material-symbols-outlined text-[13px]">verified_user</span>
                        {row.ip}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: SYSTEM HEALTH & INTEGRITY WIDGET ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-space-md p-5 rounded-xl bg-surface-container-low shadow-sm border border-outline-variant/20">
        {/* Health 1: Storage Limit */}
        <div className="flex items-start gap-space-sm">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]">cloud_done</span>
          </div>
          <div className="flex flex-col gap-1 w-full">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                Penyimpanan Berkas Terproteksi
              </span>
              <span className="font-caption text-caption text-tertiary font-bold">Aman (8.5%)</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '8.5%' }} />
            </div>
            <span className="font-caption text-caption text-on-surface-variant">
              42.8 GB / 500 GB Digunakan
            </span>
          </div>
        </div>

        {/* Health 2: Whitelist File Extensions */}
        <div className="flex items-start gap-space-sm">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[20px]">security</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">
              Whitelist Ekstensi Berkas
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {['.pdf', '.docx', '.xlsx', '.zip'].map((ext) => (
                <span key={ext} className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[11px] text-secondary">
                  {ext}
                </span>
              ))}
            </div>
            <span className="font-caption text-caption text-tertiary font-medium">
              Maks. 10MB &bull; Validasi MIME Ganda Aktif
            </span>
          </div>
        </div>

        {/* Health 3: Gatekeeping Presensi */}
        <div className="flex items-start gap-space-sm">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-[20px]">lock_clock</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">
              Gatekeeping Presensi Ujian
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-title-md text-title-md text-tertiary font-bold">Min. 70%</span>
              <span className="font-caption text-caption text-on-surface-variant">(12 / 16 Sesi Perkuliahan)</span>
            </div>
            <span className="font-caption text-caption text-on-surface-variant">
              Auto-lock kartu UTS/UAS terintegrasi realtime
            </span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
