import React, { useState, useRef } from 'react';
import AppShell from '../../components/AppShell';

/**
 * UnggahMateri — Feature Component
 * Modal & Dropzone Upload Materi 6-State Validasi (A-F) dengan SHA-256 Simulation.
 * Berdasarkan desain unggah_materi.html (MVP 2).
 */
export default function UnggahMateri({ onNavigate, onRoleChange, activeRole = 'dosen' }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState('idle');
  // States: 'idle' | 'validating' | 'uploading' | 'success' | 'error-type' | 'error-size'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    meeting: 'P1',
    description: '',
    visibility: 'published',
  });
  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Whitelist sesuai SRS 7.5 / BR-007 dan kebijakan backend (STORAGE.DOC_*):
  // .pdf/.docx/.xlsx/.zip dengan batas 10MB per berkas.
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.zip'];
  const MAX_SIZE_MB = 10;

  const simulateUpload = (file) => {
    // State A: Validating
    setUploadState('validating');
    setUploadProgress(0);

    setTimeout(() => {
      // Check file type
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        // State E: Error - Invalid Type
        setUploadState('error-type');
        return;
      }

      // Check file size
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        // State F: Error - Too Large
        setUploadState('error-size');
        return;
      }

      // State B/C: Uploading with progress
      setUploadState('uploading');
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          // State D: Success
          setTimeout(() => {
            setUploadState('success');
            showToast(`"${file.name}" berhasil diunggah dengan integritas SHA-256 terverifikasi.`);
          }, 300);
        }
        setUploadProgress(Math.min(progress, 100));
      }, 200);
    }, 800);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      simulateUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      simulateUpload(file);
    }
  };

  const handleReset = () => {
    setUploadState('idle');
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const meetings = Array.from({ length: 16 }, (_, i) => {
    const num = i + 1;
    let label = `Pertemuan ${num} (P${num})`;
    if (num === 8) label = `Pertemuan 8 — UTS (P8)`;
    if (num === 16) label = `Pertemuan 16 — UAS (P16)`;
    return { value: `P${num}`, label };
  });

  return (
    <AppShell
      activeRole={activeRole}
      onRoleChange={onRoleChange}
      activeNavPath="unggah-materi"
      onNavChange={onNavigate}
    >
      {/* Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30 animate-fade-in"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col w-full space-y-space-md max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-body-sm text-body-sm text-outline">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('dasbor-dosen')}
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">home</span>
            Dashboard
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('kelola-kelas')}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            Kelola Kelas
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('manajemen-materi')}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            Manajemen Materi
          </button>
          <span>/</span>
          <span className="text-secondary font-label-sm font-semibold">Unggah Materi</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">cloud_upload</span>
            Unggah Materi Pembelajaran
          </h1>
          <p className="font-body-sm text-sm text-on-surface-variant mt-1">
            Seret file atau klik area di bawah untuk mengunggah materi baru ke kelas.
          </p>
        </div>

        {/* Dropzone Area */}
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleDrop}
          onClick={() => uploadState === 'idle' && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (uploadState !== 'idle') return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={uploadState === 'idle' ? 0 : -1}
          aria-label="Area unggah berkas. Seret berkas ke sini, atau tekan Enter untuk memilih berkas dari komputer."
          className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            dragActive
              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
              : uploadState === 'idle'
              ? 'border-outline-variant/40 bg-surface-container-low hover:border-primary/50 hover:bg-surface-container'
              : 'border-outline-variant/20 bg-surface-container-low cursor-default'
          }`}
        >
          <input
            ref={fileInputRef}
            id="materi-file-input"
            type="file"
            accept={ALLOWED_EXTENSIONS.join(',')}
            onChange={handleFileSelect}
            aria-hidden="true"
            tabIndex={-1}
            className="hidden"
          />

          {/* State A: Idle */}
          {uploadState === 'idle' && (
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-primary text-[36px]">
                  {dragActive ? 'file_download' : 'cloud_upload'}
                </span>
              </div>
              <div>
                <p className="font-title-md text-on-surface font-bold">
                  {dragActive ? 'Lepaskan file di sini' : 'Seret dan lepas file di sini'}
                </p>
                <p className="font-body-sm text-sm text-on-surface-variant mt-1">
                  atau <span className="text-primary font-semibold underline">klik untuk memilih file</span>
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-outline font-mono">
                <span>PDF</span>
                <span>•</span>
                <span>DOCX</span>
                <span>•</span>
                <span>XLSX</span>
                <span>•</span>
                <span>ZIP</span>
              </div>
              <p className="text-[11px] text-outline">Maksimal {MAX_SIZE_MB}MB per berkas</p>
            </div>
          )}

          {/* State B: Validating */}
          {uploadState === 'validating' && selectedFile && (
            <div role="status" aria-live="polite" className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-warning-soft flex items-center justify-center mx-auto animate-pulse">
                <span className="material-symbols-outlined text-warning-ink text-[36px]">shield</span>
              </div>
              <p className="font-title-md text-on-surface font-bold">Memvalidasi file...</p>
              <p className="font-body-sm text-sm text-on-surface-variant">
                Memeriksa tipe file, ukuran, dan menghitung hash SHA-256
              </p>
              <p className="font-mono text-xs text-outline">{selectedFile.name}</p>
            </div>
          )}

          {/* State C: Uploading */}
          {uploadState === 'uploading' && selectedFile && (
            <div role="status" aria-live="polite" className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-primary text-[36px] animate-bounce">cloud_upload</span>
              </div>
              <p className="font-title-md text-on-surface font-bold">Mengunggah file...</p>
              <div className="max-w-sm mx-auto">
                <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                  <span className="font-mono">{selectedFile.name}</span>
                  <span className="font-bold text-primary">{Math.round(uploadProgress)}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(uploadProgress)}
                  className="w-full bg-surface-container rounded-full h-3 overflow-hidden"
                >
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-outline mt-1">{formatSize(selectedFile.size)}</p>
              </div>
            </div>
          )}

          {/* State D: Success */}
          {uploadState === 'success' && selectedFile && (
            <div role="status" aria-live="polite" className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-success-soft flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-success-ink text-[36px]">check_circle</span>
              </div>
              <p className="font-title-md text-success-ink font-bold">File Berhasil Diunggah!</p>
              <div className="bg-surface-container rounded-xl p-3 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-2 text-sm text-on-surface font-semibold">
                  <span className="material-symbols-outlined text-primary text-[18px]">description</span>
                  {selectedFile.name}
                </div>
                <div className="text-xs text-outline font-mono mt-1">
                  Ukuran: {formatSize(selectedFile.size)} • SHA-256: a1b2c3...verified
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold hover:shadow-lg transition-all"
              >
                Unggah File Lain
              </button>
            </div>
          )}

          {/* State E: Error - Invalid Type */}
          {uploadState === 'error-type' && selectedFile && (
            <div role="alert" aria-live="assertive" className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-danger-soft flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-danger-ink text-[36px]">error</span>
              </div>
              <p className="font-title-md text-danger-ink font-bold">Tipe File Tidak Didukung</p>
              <p className="font-body-sm text-sm text-on-surface-variant">
                Format berkas tidak didukung. Harap unggah file berformat{' '}
                <strong>.pdf, .docx, .xlsx, atau .zip</strong>.
              </p>
              <div className="bg-danger-soft border border-danger-border rounded-lg p-3 max-w-sm mx-auto">
                <p className="text-xs text-danger-ink">
                  Berkas <span className="font-mono">{selectedFile.name}</span> berada di luar whitelist ekstensi yang
                  diizinkan sistem.
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-sm hover:bg-surface-container-high transition-all border border-outline-variant/30"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* State F: Error - Too Large */}
          {uploadState === 'error-size' && selectedFile && (
            <div role="alert" aria-live="assertive" className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-danger-soft flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-danger-ink text-[36px]">file_upload_off</span>
              </div>
              <p className="font-title-md text-danger-ink font-bold">Ukuran File Terlalu Besar</p>
              <p className="font-body-sm text-sm text-on-surface-variant">
                Ukuran berkas melebihi batas maksimal yang diizinkan (maks. {MAX_SIZE_MB}MB).
              </p>
              <div className="max-w-sm mx-auto w-full">
                <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                  <span className="font-mono">{selectedFile.name}</span>
                  <span className="font-bold text-danger-ink">
                    {formatSize(selectedFile.size)} / {MAX_SIZE_MB} MB
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-danger h-3 rounded-full"
                    style={{
                      width: `${Math.min(100, (selectedFile.size / (MAX_SIZE_MB * 1024 * 1024)) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-sm hover:bg-surface-container-high transition-all border border-outline-variant/30"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* Metadata Form (shown when not in error or idle without file) */}
        {(uploadState === 'success' || uploadState === 'idle') && (
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-6 space-y-4">
            <h2 className="font-title-md text-on-surface font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">edit_note</span>
              Informasi Materi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label
                  htmlFor="materi-judul"
                  className="block font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1"
                >
                  Judul Materi *
                </label>
                <input
                  id="materi-judul"
                  type="text"
                  required
                  aria-required="true"
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Modul 1 — Pengantar Rekayasa Perangkat Lunak"
                  className="w-full bg-surface-container text-on-surface font-body-sm text-sm px-4 py-2.5 rounded-xl placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Meeting Select */}
              <div>
                <label
                  htmlFor="materi-pertemuan"
                  className="block font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1"
                >
                  Pertemuan Tujuan *
                </label>
                <select
                  id="materi-pertemuan"
                  aria-required="true"
                  value={formData.meeting}
                  onChange={(e) => setFormData((f) => ({ ...f, meeting: e.target.value }))}
                  className="w-full bg-surface-container text-on-surface font-body-sm text-sm px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {meetings.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label
                  htmlFor="materi-visibilitas"
                  className="block font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1"
                >
                  Visibilitas
                </label>
                <select
                  id="materi-visibilitas"
                  value={formData.visibility}
                  onChange={(e) => setFormData((f) => ({ ...f, visibility: e.target.value }))}
                  className="w-full bg-surface-container text-on-surface font-body-sm text-sm px-4 py-2.5 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="published">Publik — langsung terlihat mahasiswa</option>
                  <option value="draft">Draf — hanya dosen yang bisa melihat</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="materi-deskripsi"
                  className="block font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1"
                >
                  Deskripsi (Opsional)
                </label>
                <textarea
                  id="materi-deskripsi"
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Keterangan tambahan tentang materi ini..."
                  className="w-full bg-surface-container text-on-surface font-body-sm text-sm px-4 py-2.5 rounded-xl placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('manajemen-materi')}
                className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-sm hover:bg-surface-container-high transition-all border border-outline-variant/30"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Materi berhasil disimpan ke kelas.');
                  setTimeout(() => onNavigate && onNavigate('manajemen-materi'), 1500);
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Simpan Materi
              </button>
            </div>
          </div>
        )}

        {/* Accepted File Types Reference */}
        <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4">
          <h3 className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-3">
            Format File yang Diterima
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { ext: 'PDF', icon: 'picture_as_pdf', color: 'text-danger-ink', bg: 'bg-danger-soft' },
              { ext: 'DOCX', icon: 'description', color: 'text-primary', bg: 'bg-primary/10' },
              { ext: 'XLSX', icon: 'table_chart', color: 'text-success-ink', bg: 'bg-success-soft' },
              { ext: 'ZIP', icon: 'folder_zip', color: 'text-info-ink', bg: 'bg-info-soft' },
            ].map((t) => (
              <div
                key={t.ext}
                className={`flex items-center gap-2 ${t.bg} rounded-lg px-3 py-2`}
              >
                <span className={`material-symbols-outlined ${t.color} text-[18px]`}>{t.icon}</span>
                <span className="font-label-sm text-xs text-on-surface font-semibold">{t.ext}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
