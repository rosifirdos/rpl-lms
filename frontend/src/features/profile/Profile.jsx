import React, { useState } from 'react';
import AppShell from '../../components/AppShell';
import { useAuthStore } from '../../stores/authStore';
import { userFixtures } from '../shell/fixtures';

export default function Profile({ onRoleChange, onNavigate, activeRole = 'mahasiswa' }) {
  const storeUser = useAuthStore((s) => s.user);
  const fixture = userFixtures[activeRole] || userFixtures.mahasiswa;

  const [activeTab, setActiveTab] = useState('biodata'); // 'biodata' | 'keamanan'
  const [toastMessage, setToastMessage] = useState(null);

  // Biodata form state
  const [fullName, setFullName] = useState(storeUser?.name || fixture.name);
  const [phone, setPhone] = useState('0812-3456-7890');
  const [bio, setBio] = useState('Mahasiswa aktif Fakultas Pendidikan Teknologi Informasi dan Komunikasi (FPTIK) Universitas PGRI Semarang.');
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Security form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      showToast('Format foto tidak valid. Gunakan format .jpg, .jpeg, atau .png.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran foto melebihi batas maksimal 2MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    showToast('Foto profil baru berhasil diunggah.');
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Kosong', color: 'bg-outline-variant' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Lemah', color: 'bg-error' };
    if (score === 2) return { score: 50, label: 'Cukup', color: 'bg-warning-solid' };
    if (score === 3) return { score: 75, label: 'Kuat', color: 'bg-secondary' };
    return { score: 100, label: 'Sangat Kuat', color: 'bg-tertiary' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleSaveBiodata = (e) => {
    e.preventDefault();
    showToast('Perubahan biodata diri berhasil disimpan ke basis data.');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Kata sandi saat ini wajib diisi.');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Kata sandi Anda berhasil diperbarui.');
  };

  const userInitials = fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AppShell
      activeRole={activeRole}
      onRoleChange={onRoleChange}
      activeNavPath="profile"
      onNavChange={onNavigate}
    >
      {/* Toast Alert */}
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

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-space-md">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate && onNavigate(`dasbor-${activeRole}`);
          }}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>Beranda</span>
        </a>
        <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
        <span className="text-secondary font-semibold">Pengelolaan Profil Pengguna</span>
      </nav>

      {/* Header Profile Card (Fase 3.4 Spec) */}
      <section className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-space-lg shadow-sm mb-space-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-space-lg">
          {/* Avatar Block with Upload Overlay */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary font-bold text-2xl sm:text-3xl shadow-md overflow-hidden border-4 border-surface-container">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            <label
              htmlFor="avatar-upload-input"
              className="absolute inset-0 rounded-full bg-overlay text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-1"
            >
              <span className="material-symbols-outlined text-[24px]">photo_camera</span>
              <span className="text-[10px] font-semibold mt-0.5">Ubah Foto</span>
            </label>
            <input
              id="avatar-upload-input"
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                {fullName}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-sm text-[11px] font-bold uppercase tracking-wider border border-tertiary/20">
                AKTIF
              </span>
            </div>
            <p className="font-mono text-body-md text-on-surface-variant font-medium mb-2">
              {fixture.identifier} &bull; <span className="capitalize">{activeRole}</span>
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-space-sm text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
                {fixture.email}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">school</span>
                FPTIK UPGRIS
              </span>
            </div>
          </div>

          {/* Upload Button */}
          <div className="self-center sm:self-start">
            <label
              htmlFor="avatar-upload-input-btn"
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-label-md font-semibold transition-all border border-outline-variant/30 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">upload</span>
              <span>Unggah Foto Baru</span>
            </label>
            <input
              id="avatar-upload-input-btn"
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <p className="text-[11px] text-outline text-center mt-1">Maks. 2MB (.jpg, .png)</p>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-space-sm border-b border-outline-variant/30 mb-space-lg">
        <button
          type="button"
          onClick={() => setActiveTab('biodata')}
          className={`pb-3 px-space-sm font-label-md text-label-md font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'biodata'
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">badge</span>
          <span>Biodata Diri</span>
          {activeTab === 'biodata' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('keamanan')}
          className={`pb-3 px-space-sm font-label-md text-label-md font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'keamanan'
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">lock_reset</span>
          <span>Keamanan &amp; Kata Sandi</span>
          {activeTab === 'keamanan' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* TAB 1: BIODATA DIRI */}
      {activeTab === 'biodata' && (
        <form onSubmit={handleSaveBiodata} className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-space-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg mb-space-lg">
            <div>
              <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                Nomor Identitas Resmi (NIM / NIDN / NIP)
              </label>
              <input
                type="text"
                readOnly
                value={fixture.identifier}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface-variant font-mono text-body-md cursor-not-allowed"
              />
              <span className="text-[11px] text-outline mt-1 block">Dikelola langsung oleh Pusat PTIK UPGRIS (Read-only).</span>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                Email Resmi Terdaftar
              </label>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  value={fixture.email}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface-variant font-body-md cursor-not-allowed pr-10"
                />
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-tertiary text-[20px]">
                  check_circle
                </span>
              </div>
              <span className="text-[11px] text-tertiary mt-1 block">Email terverifikasi untuk notifikasi sistem.</span>
            </div>

            <div>
              <label htmlFor="input-full-name" className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                Nama Lengkap
              </label>
              <input
                id="input-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-body-md"
              />
            </div>

            <div>
              <label htmlFor="input-phone" className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                Nomor WhatsApp / Telepon
              </label>
              <input
                id="input-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-body-md"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="input-bio" className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                Bio / Informasi Singkat
              </label>
              <textarea
                id="input-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-body-md resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-outline-variant/20">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary/90 transition-all shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Simpan Perubahan Biodata</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: KEAMANAN & KATA SANDI */}
      {activeTab === 'keamanan' && (
        <form onSubmit={handleUpdatePassword} className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-space-lg shadow-sm max-w-2xl">
          <div className="flex flex-col gap-space-md mb-space-lg">
            <div>
              <label htmlFor="input-current-pass" className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <input
                  id="input-current-pass"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Masukkan kata sandi lama"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-body-md pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showCurrentPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="input-new-pass" className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="input-new-pass"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimal 8 karakter kombinasi"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-body-md pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showNewPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Strength Meter Bar */}
              {newPassword && (
                <div className="mt-2 flex flex-col gap-1">
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant">Kekuatan Sandi:</span>
                    <span className="font-semibold text-on-surface">{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="input-confirm-pass" className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="input-confirm-pass"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-body-md pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-outline-variant/20">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary/90 transition-all shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Perbarui Kata Sandi</span>
            </button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
