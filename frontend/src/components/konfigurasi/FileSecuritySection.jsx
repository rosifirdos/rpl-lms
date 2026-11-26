import React, { useState } from 'react';
import { BLACKLISTED_EXTENSIONS } from '../../data/defaultSettings';

export default function FileSecuritySection({
  config,
  onChange,
  onShowToast,
}) {
  const [newExtInput, setNewExtInput] = useState('');

  const handleToggleExt = (ext) => {
    if (ext === '.pdf') return; // Regulasi wajib
    const currentList = config.allowedExtensions || [];
    if (currentList.includes(ext)) {
      onChange('allowedExtensions', currentList.filter((e) => e !== ext));
    } else {
      onChange('allowedExtensions', [...currentList, ext]);
    }
  };

  const handleAddExtension = (e) => {
    if (e) e.preventDefault();
    let ext = newExtInput.trim().toLowerCase();
    if (!ext) return;
    if (!ext.startsWith('.')) ext = '.' + ext;

    if (BLACKLISTED_EXTENSIONS.includes(ext)) {
      if (onShowToast) {
        onShowToast(
          `Ekstensi ${ext} dilarang permanen oleh sistem keamanan Gateway WAF UPGRIS!`,
          'error'
        );
      }
      return;
    }

    const currentList = config.allowedExtensions || [];
    if (currentList.includes(ext)) {
      if (onShowToast) {
        onShowToast(`Ekstensi ${ext} sudah ada dalam whitelist.`, 'warning');
      }
      return;
    }

    onChange('allowedExtensions', [...currentList, ext]);
    setNewExtInput('');
    if (onShowToast) {
      onShowToast(`Ekstensi ${ext} berhasil ditambahkan ke whitelist.`, 'success');
    }
  };

  const handlePayloadChange = (val) => {
    const num = Math.max(1, Math.min(25, Number(val) || 1));
    onChange('payloadLimit', num);
  };

  return (
    <section
      id="sec-keamanan"
      className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">arrow_forward_ios</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs flex-wrap">
              <h3 className="font-title-lg text-title-lg text-on-surface">
                1. Kebijakan Keamanan &amp; Validasi Berkas
              </h3>
              <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-outline font-caption text-caption">
                BR-007, BR-008, FR-049, NFR-003
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Mengatur whitelist ekstensi, batas muatan HTTP, serta verifikasi biner integritas dokumen tugas dan materi.
            </p>
          </div>
        </div>
      </div>

      {/* Whitelist Format Berkas */}
      <div className="flex flex-col gap-space-sm bg-surface-container p-space-md rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
            Whitelist Ekstensi Berkas Unggahan
            <span
              className="material-symbols-outlined text-[16px] text-outline cursor-help"
              title="Format dokumen yang disetujui server"
            >
              help
            </span>
          </label>
          <span className="font-caption text-caption text-tertiary flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            Strict Sandbox Mode
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Pill PDF (Mandatory) */}
          <label className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold cursor-not-allowed select-none">
            <input
              type="checkbox"
              checked
              disabled
              className="accent-primary w-4 h-4 rounded"
            />
            <span>.pdf (Wajib Regulasi)</span>
          </label>

          {/* Standard and Custom Pills */}
          {['.docx', '.xlsx', '.zip'].map((ext) => {
            const isChecked = config.allowedExtensions.includes(ext);
            return (
              <label
                key={ext}
                onClick={() => handleToggleExt(ext)}
                className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-sm text-label-sm font-medium transition-colors cursor-pointer select-none ${
                  isChecked
                    ? 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
                    : 'bg-surface-container-lowest text-outline hover:text-on-surface-variant'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="accent-primary w-4 h-4 rounded cursor-pointer"
                />
                <span>{ext}</span>
              </label>
            );
          })}

          {/* Other Custom Added Extensions */}
          {config.allowedExtensions
            .filter((ext) => !['.pdf', '.docx', '.xlsx', '.zip'].includes(ext))
            .map((ext) => (
              <div
                key={ext}
                className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-medium"
              >
                <span>{ext}</span>
                <button
                  type="button"
                  onClick={() => handleToggleExt(ext)}
                  className="hover:text-error transition-colors"
                  title="Hapus ekstensi"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}

          {/* Custom Add Input */}
          <form
            onSubmit={handleAddExtension}
            className="flex items-center gap-1 bg-surface-container-lowest rounded-lg px-2 py-1"
          >
            <input
              type="text"
              value={newExtInput}
              onChange={(e) => setNewExtInput(e.target.value)}
              placeholder="+ Tambah .ext"
              className="bg-transparent font-caption text-caption text-on-surface placeholder-outline focus:outline-none w-24"
            />
            <button
              type="submit"
              className="p-0.5 text-primary hover:text-on-surface cursor-pointer"
              title="Tambah ekstensi"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
            </button>
          </form>
        </div>

        {/* Blacklist notification pill */}
        <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-error-container/20 text-on-surface font-body-sm text-body-sm mt-1">
          <span className="material-symbols-outlined text-error text-[20px] shrink-0">block</span>
          <div className="flex flex-col">
            <span className="font-semibold text-error text-label-sm font-label-sm">
              Ekstensi Dilarang Permanen:
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              .exe, .sh, .php, .js, .bat, .cmd, .py, .jar â€” Otomatis Ditolak Sistem Keamanan Gateway WAF UPGRIS.
            </span>
          </div>
        </div>
      </div>

      {/* Batas Maksimal Ukuran Berkas Slider & Input */}
      <div className="flex flex-col gap-space-sm bg-surface-container p-space-md rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-col">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Batas Maksimal Ukuran Berkas (Payload Size Limit)
            </label>
            <span className="font-caption text-caption text-on-surface-variant">
              Batas ukuran berlaku untuk materi perkuliahan dosen dan unggahan berkas submission tugas mahasiswa (HTTP 413 Payload Too Large protection).
            </span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1.5 rounded-lg shrink-0">
            <input
              type="number"
              id="payload-number"
              min="1"
              max="25"
              value={config.payloadLimit}
              onChange={(e) => handlePayloadChange(e.target.value)}
              className="w-12 text-center bg-transparent font-title-md text-title-md font-bold text-primary focus:outline-none"
            />
            <span className="font-label-md text-label-md text-on-surface-variant font-bold">MB</span>
          </div>
        </div>

        {/* Range slider */}
        <div className="flex items-center gap-space-md pt-2">
          <span className="font-caption text-caption text-outline">1 MB</span>
          <input
            type="range"
            id="payload-range"
            min="1"
            max="25"
            value={config.payloadLimit}
            onChange={(e) => handlePayloadChange(e.target.value)}
            className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer"
          />
          <span className="font-caption text-caption text-outline">25 MB</span>
        </div>

        <div className="flex items-center justify-between text-outline font-caption text-caption mt-1 flex-wrap gap-1">
          <span>Rekomendasi server: 10 MB per file submission</span>
          <span className="text-tertiary">Optimal untuk throughput bandwidth jaringan kampus</span>
        </div>
      </div>

      {/* Validasi MIME-type & Private Storage Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Toggle 1: MIME-Type */}
        <div className="flex flex-col justify-between p-space-md rounded-lg bg-surface-container">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Pemeriksaan MIME-Type Sisi Server
              </span>
              <span className="font-caption text-caption text-on-surface-variant mt-1">
                Anti-spoofing header biner (Magic Bytes inspection) mencegah manipulasi file executable bertopeng .pdf.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.mimeTypeCheck}
                onChange={(e) => onChange('mimeTypeCheck', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-container" />
            </label>
          </div>
          <div className="mt-space-md flex items-center gap-1 font-caption text-caption text-tertiary">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>Proteksi NFR-003 Aktif</span>
          </div>
        </div>

        {/* Toggle 2: Private Storage */}
        <div className="flex flex-col justify-between p-space-md rounded-lg bg-surface-container">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Isolasi Penyimpanan Berkas Privat
              </span>
              <span className="font-caption text-caption text-on-surface-variant mt-1">
                Unggahan tugas disimpan di direktori privat terisolasi di luar public webroot web server.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.privateStorage}
                onChange={(e) => onChange('privateStorage', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary-container" />
            </label>
          </div>
          <div className="mt-space-md flex items-center gap-1 font-caption text-caption text-on-surface-variant font-mono">
            <span className="material-symbols-outlined text-[14px] text-secondary">folder_open</span>
            <span>/storage/spada/protected/</span>
          </div>
        </div>
      </div>
    </section>
  );
}
