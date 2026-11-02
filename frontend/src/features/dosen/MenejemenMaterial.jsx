import React, { useState } from 'react';
import AppShell from '../../components/AppShell';

/**
 * MenejemenMaterial — Feature Component
 * Daftar & Penghapusan Materi Terproteksi dengan SHA-256 Download Simulation.
 * Berdasarkan desain menejemen_material.html (MVP 2).
 */
export default function MenejemenMaterial({ onNavigate, onRoleChange, activeRole = 'dosen' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'pdf' | 'pptx' | 'video' | 'doc'
  const [deleteModal, setDeleteModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [materials, setMaterials] = useState([
    {
      id: 1,
      title: 'Modul 1 — Pengantar Rekayasa Perangkat Lunak',
      fileName: 'modul-01-pengantar-rpl.pdf',
      type: 'pdf',
      size: '2.4 MB',
      meeting: 'P1',
      uploadedAt: '2026-09-02 08:30',
      downloads: 34,
      sha256: 'a1b2c3d4e5f6...78901234',
      status: 'published',
    },
    {
      id: 2,
      title: 'Slide Presentasi — Proses Model Perangkat Lunak',
      fileName: 'slide-p2-proses-model.pptx',
      type: 'pptx',
      size: '5.1 MB',
      meeting: 'P2',
      uploadedAt: '2026-09-09 09:15',
      downloads: 28,
      sha256: 'b2c3d4e5f6a1...89012345',
      status: 'published',
    },
    {
      id: 3,
      title: 'Video Tutorial — Use Case Diagram',
      fileName: 'tutorial-use-case-diagram.mp4',
      type: 'video',
      size: '45.2 MB',
      meeting: 'P3',
      uploadedAt: '2026-09-16 10:00',
      downloads: 22,
      sha256: 'c3d4e5f6a1b2...90123456',
      status: 'published',
    },
    {
      id: 4,
      title: 'Panduan Praktikum — Activity Diagram',
      fileName: 'panduan-activity-diagram.docx',
      type: 'doc',
      size: '1.8 MB',
      meeting: 'P4',
      uploadedAt: '2026-09-23 07:45',
      downloads: 19,
      sha256: 'd4e5f6a1b2c3...01234567',
      status: 'published',
    },
    {
      id: 5,
      title: 'Modul 5 — Perancangan Arsitektur Sistem',
      fileName: 'modul-05-arsitektur-sistem.pdf',
      type: 'pdf',
      size: '3.6 MB',
      meeting: 'P5',
      uploadedAt: '2026-09-30 08:00',
      downloads: 15,
      sha256: 'e5f6a1b2c3d4...12345678',
      status: 'published',
    },
    {
      id: 6,
      title: 'Slide Review — Persiapan UTS',
      fileName: 'slide-review-uts.pptx',
      type: 'pptx',
      size: '8.3 MB',
      meeting: 'P7',
      uploadedAt: '2026-10-14 11:30',
      downloads: 38,
      sha256: 'f6a1b2c3d4e5...23456789',
      status: 'published',
    },
    {
      id: 7,
      title: 'Modul 9 — Pengujian Perangkat Lunak',
      fileName: 'modul-09-pengujian.pdf',
      type: 'pdf',
      size: '2.9 MB',
      meeting: 'P9',
      uploadedAt: '2026-10-28 08:15',
      downloads: 8,
      sha256: 'a7b8c9d0e1f2...34567890',
      status: 'draft',
    },
  ]);

  const typeConfig = {
    pdf: { icon: 'picture_as_pdf', color: 'text-rose-400', bg: 'bg-rose-500/20', label: 'PDF' },
    pptx: { icon: 'slideshow', color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'PPTX' },
    video: { icon: 'videocam', color: 'text-sky-400', bg: 'bg-sky-500/20', label: 'Video' },
    doc: { icon: 'description', color: 'text-primary', bg: 'bg-primary/20', label: 'DOCX' },
  };

  const filteredMaterials = materials
    .filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = filterType === 'all' || m.type === filterType;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      if (sortBy === 'oldest') return new Date(a.uploadedAt) - new Date(b.uploadedAt);
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      if (sortBy === 'size') return parseFloat(b.size) - parseFloat(a.size);
      return 0;
    });

  const handleDelete = (material) => {
    setMaterials((prev) => prev.filter((m) => m.id !== material.id));
    setDeleteModal(null);
    showToast(`"${material.title}" berhasil dihapus secara permanen.`);
  };

  const handleDownload = (material) => {
    showToast(`Mengunduh ${material.fileName} — SHA-256: ${material.sha256}`);
  };

  const totalSize = materials.reduce((acc, m) => acc + parseFloat(m.size), 0).toFixed(1);
  const totalDownloads = materials.reduce((acc, m) => acc + m.downloads, 0);

  return (
    <AppShell
      activeRole={activeRole}
      onRoleChange={onRoleChange}
      activeNavPath="manajemen-materi"
      onNavChange={onNavigate}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30 animate-fade-in">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-high rounded-2xl shadow-2xl border border-outline-variant/30 max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-rose-400 text-[28px]">delete_forever</span>
              </div>
              <div>
                <h3 className="font-title-md font-bold text-on-surface">Konfirmasi Penghapusan</h3>
                <p className="font-body-sm text-xs text-on-surface-variant">Aksi ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-4 mb-4 border border-outline-variant/20">
              <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
                Anda akan menghapus materi berikut secara <strong className="text-rose-400">permanen</strong>:
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`material-symbols-outlined ${typeConfig[deleteModal.type].color} text-[20px]`}>
                  {typeConfig[deleteModal.type].icon}
                </span>
                <span className="font-label-md text-sm text-on-surface font-semibold">{deleteModal.title}</span>
              </div>
              <p className="font-body-sm text-xs text-outline mt-1 font-mono">{deleteModal.fileName}</p>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-rose-400 text-[16px] mt-0.5">warning</span>
                <p className="font-body-sm text-xs text-rose-300 leading-relaxed">
                  File akan dihapus dari server dan tidak dapat dipulihkan. Mahasiswa yang sudah mengunduh tetap memiliki salinan lokal.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-sm hover:bg-surface-container-high transition-all border border-outline-variant/30"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteModal)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-label-md text-sm font-bold hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full space-y-space-md">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-body-sm text-body-sm text-outline">
          <button
            onClick={() => onNavigate && onNavigate('dasbor-dosen')}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            Dasbor
          </button>
          <span>/</span>
          <button
            onClick={() => onNavigate && onNavigate('kelas-diampu')}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            Kelas Diampu
          </button>
          <span>/</span>
          <button
            onClick={() => onNavigate && onNavigate('kelola-kelas')}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            Kelola Kelas
          </button>
          <span>/</span>
          <span className="text-secondary font-label-sm font-semibold">Manajemen Materi</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-space-md">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[28px]">folder_managed</span>
              Manajemen Materi Pembelajaran
            </h1>
            <p className="font-body-sm text-sm text-on-surface-variant mt-1">
              Kelola file materi untuk semua pertemuan — PDF, slide, video, dan dokumen pendukung.
            </p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('unggah-materi')}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
            Unggah Materi Baru
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm text-center">
            <div className="text-headline-md font-bold text-primary">{materials.length}</div>
            <div className="text-xs text-on-surface-variant mt-0.5">Total Materi</div>
          </div>
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm text-center">
            <div className="text-headline-md font-bold text-secondary">{totalSize} MB</div>
            <div className="text-xs text-on-surface-variant mt-0.5">Total Ukuran</div>
          </div>
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm text-center">
            <div className="text-headline-md font-bold text-tertiary">{totalDownloads}</div>
            <div className="text-xs text-on-surface-variant mt-0.5">Total Unduhan</div>
          </div>
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm text-center">
            <div className="text-headline-md font-bold text-emerald-400">
              {materials.filter((m) => m.status === 'published').length}
            </div>
            <div className="text-xs text-on-surface-variant mt-0.5">Terpublikasi</div>
          </div>
        </div>

        {/* Filter / Search / Sort */}
        <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/20 flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'pdf', label: 'PDF' },
              { key: 'pptx', label: 'PPTX' },
              { key: 'video', label: 'Video' },
              { key: 'doc', label: 'DOCX' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setFilterType(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === t.key
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-space-sm flex-1 min-w-[200px] max-w-md">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari materi..."
                className="w-full bg-surface-container text-on-surface font-body-sm text-body-sm pl-9 pr-3 py-2 rounded-lg placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container text-on-surface font-body-sm text-xs px-3 py-2 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="downloads">Unduhan Terbanyak</option>
              <option value="size">Ukuran Terbesar</option>
            </select>
          </div>
        </div>

        {/* Material List */}
        <div className="space-y-3">
          {filteredMaterials.length === 0 && (
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-8 text-center">
              <span className="material-symbols-outlined text-outline text-[48px] mb-3 block">folder_off</span>
              <p className="font-body-md text-on-surface-variant">Tidak ada materi yang cocok dengan filter.</p>
            </div>
          )}

          {filteredMaterials.map((material) => {
            const tc = typeConfig[material.type];
            return (
              <div
                key={material.id}
                className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                {/* File Type Icon */}
                <div className={`w-12 h-12 rounded-xl ${tc.bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined ${tc.color} text-[28px]`}>{tc.icon}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-title-md text-sm font-bold text-on-surface truncate">{material.title}</h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        material.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {material.status === 'published' ? 'Publik' : 'Draf'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-secondary-container/30 text-secondary text-[10px] font-bold">
                      {material.meeting}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-outline font-mono">
                    <span>{material.fileName}</span>
                    <span>•</span>
                    <span>{material.size}</span>
                    <span>•</span>
                    <span>{material.uploadedAt}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    <span>{material.downloads} unduhan</span>
                    <span className="mx-1 text-outline">•</span>
                    <span className="font-mono text-outline text-[10px]">SHA-256: {material.sha256}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(material)}
                    className="w-9 h-9 rounded-lg bg-surface-container hover:bg-primary/20 flex items-center justify-center transition-all"
                    title="Unduh"
                  >
                    <span className="material-symbols-outlined text-primary text-[20px]">download</span>
                  </button>
                  <button
                    className="w-9 h-9 rounded-lg bg-surface-container hover:bg-secondary/20 flex items-center justify-center transition-all"
                    title="Edit Info"
                  >
                    <span className="material-symbols-outlined text-secondary text-[20px]">edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteModal(material)}
                    className="w-9 h-9 rounded-lg bg-surface-container hover:bg-rose-500/20 flex items-center justify-center transition-all"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-rose-400 text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
