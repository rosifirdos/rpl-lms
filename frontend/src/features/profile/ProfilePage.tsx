/**
 * features/profile/ProfilePage.tsx
 *
 * Halaman Profil Mandiri terhubung API (Fase 2, FR-005 s/d FR-008):
 * - Muat `GET /profile` via TanStack Query (skeleton saat memuat).
 * - Tab Biodata: `PUT /profile` (full_name, phone, bio); NIM/NIDN & email
 *   read-only; identitas per peran (prodi/angkatan vs NIDN/NIP).
 * - Avatar: preview lokal, validasi klien JPG/JPEG/PNG ≤ 2 MB, unggah
 *   multipart `POST /profile/avatar`, tampil dari blob terautentikasi;
 *   400/413 ditampilkan sebagai pesan.
 * - Tab Keamanan: `PUT /profile/password` dengan indikator kekuatan;
 *   backend mencabut semua refresh token setelah sukses → force logout
 *   dan diarahkan ke `/login?password_changed=1`.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import AppShell from '../../components/AppShell';
import { Button, Input, Alert, Skeleton } from '../../components/ui';
import { useAuth } from '../../providers/AuthProvider';
import { useAuthStore } from '../../stores/authStore';
import { profileApi } from '../../services/endpoints/profile';
import { useProfileQuery, useAvatarQuery, useInvalidateProfileCache } from '../../hooks/queries/useProfile';
import {
  biodataSchema,
  changePasswordSchema,
  passwordStrength,
  type BiodataFormValues,
  type ChangePasswordFormValues,
} from '../../lib/validation';
import { HttpApiError } from '../../types/api';
import type { BackendUser } from '../../types/auth';

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Teks identitas per peran: NIM+prodi (mahasiswa) atau NIDN/NIP (dosen). */
function roleIdentity(user: BackendUser): string | null {
  if (user.mahasiswa) {
    const mhs = user.mahasiswa;
    return `NIM ${mhs.nim} • ${mhs.prodi} • Angkatan ${mhs.angkatan}`;
  }
  if (user.dosen) {
    const parts = [user.dosen.gelar_depan, user.profile?.full_name, user.dosen.gelar_belakang]
      .filter(Boolean)
      .join(' ');
    const id = user.dosen.nidn ? `NIDN ${user.dosen.nidn}` : user.dosen.nip ? `NIP ${user.dosen.nip}` : null;
    return [parts || null, id].filter(Boolean).join(' • ') || null;
  }
  return null;
}

export default function ProfilePage() {
  const { syncUser, logout } = useAuth();
  const sessionRole = useAuthStore((s) => s.getCurrentRole());
  const invalidateProfileCache = useInvalidateProfileCache();
  const navigate = useNavigate();

  const profileQuery = useProfileQuery();
  const avatarQuery = useAvatarQuery();
  const user = profileQuery.data;

  const [activeTab, setActiveTab] = useState<'biodata' | 'keamanan'>('biodata');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarNotice, setAvatarNotice] = useState<{ variant: 'success' | 'error'; text: string } | null>(null);
  const [biodataNotice, setBiodataNotice] = useState<string | null>(null);
  const pendingAvatarRef = useRef<File | null>(null);

  // Lepas URL preview sementara saat berganti/unmount.
  useEffect(() => {
    const previous = avatarPreview;
    return () => {
      if (previous && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(previous);
      }
    };
  }, [avatarPreview]);

  // -------------------------------------------------------------------------
  // Mutasi biodata
  // -------------------------------------------------------------------------
  const biodataForm = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema),
    values: user
      ? {
          full_name: user.profile?.full_name || '',
          phone: user.profile?.phone || '',
          bio: user.profile?.bio || '',
        }
      : undefined,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: BiodataFormValues) =>
      profileApi.updateProfile({
        full_name: payload.full_name,
        phone: payload.phone || null,
        bio: payload.bio || null,
      }),
    onSuccess: (updated) => {
      syncUser(updated);
      invalidateProfileCache();
      setBiodataNotice('Biodata berhasil disimpan.');
    },
    onError: (error) => {
      setBiodataNotice(
        error instanceof HttpApiError ? error.message : 'Gagal menyimpan biodata. Coba lagi.'
      );
    },
  });

  // -------------------------------------------------------------------------
  // Mutasi avatar
  // -------------------------------------------------------------------------
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (updated) => {
      syncUser(updated);
      invalidateProfileCache();
      setAvatarPreview(null);
      pendingAvatarRef.current = null;
      setAvatarNotice({ variant: 'success', text: 'Foto profil berhasil diperbarui.' });
    },
    onError: (error) => {
      setAvatarPreview(null);
      pendingAvatarRef.current = null;
      const status = error instanceof HttpApiError ? error.status : 0;
      const fallback =
        status === 413
          ? 'Ukuran foto melebihi batas maksimal server (2 MB).'
          : 'Gagal mengunggah foto profil. Coba lagi.';
      setAvatarNotice({
        variant: 'error',
        text: error instanceof HttpApiError && error.message ? error.message : fallback,
      });
    },
  });

  const handleAvatarSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      setAvatarNotice({ variant: 'error', text: 'Format foto tidak valid. Gunakan format .jpg, .jpeg, atau .png.' });
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarNotice({ variant: 'error', text: 'Ukuran foto melebihi batas maksimal 2 MB.' });
      return;
    }

    setAvatarNotice(null);
    pendingAvatarRef.current = file;
    // jsdom (test) tidak menyediakan URL.createObjectURL — preview bersifat
    // best-effort; unggahan tetap berjalan tanpa preview.
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      setAvatarPreview(URL.createObjectURL(file));
    }
    uploadAvatarMutation.mutate(file);
  };

  // -------------------------------------------------------------------------
  // Mutasi kata sandi
  // -------------------------------------------------------------------------
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });
  const newPasswordValue = passwordForm.watch('newPassword');
  const strength = useMemo(() => passwordStrength(newPasswordValue ?? ''), [newPasswordValue]);

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { oldPassword: string; newPassword: string }) =>
      profileApi.changePassword(payload),
    onSuccess: async () => {
      passwordForm.reset();
      // Backend mencabut seluruh refresh token aktif — sesi tak dapat
      // dipulihkan; bersihkan sesi dan minta login ulang.
      await logout();
      navigate('/login?password_changed=1', { replace: true });
    },
    onError: (error) => {
      const message =
        error instanceof HttpApiError && error.message
          ? error.message
          : 'Gagal mengubah kata sandi. Coba lagi.';
      passwordForm.setError('oldPassword', { message }, { shouldFocus: true });
    },
  });

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (profileQuery.isLoading) {
    return (
      <AppShell activeNavPath="profile">
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-space-lg mb-space-lg flex items-center gap-space-lg">
          <Skeleton className="w-28 h-28 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-3">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-space-lg flex flex-col gap-4">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </AppShell>
    );
  }

  if (profileQuery.isError || !user) {
    return (
      <AppShell activeNavPath="profile">
        <Alert variant="error" title="Profil tidak dapat dimuat">
          {profileQuery.error instanceof HttpApiError && profileQuery.error.message
            ? profileQuery.error.message
            : 'Terjadi kesalahan saat memuat profil Anda.'}
          <div className="mt-3">
            <Button size="sm" onClick={() => profileQuery.refetch()}>
              Coba lagi
            </Button>
          </div>
        </Alert>
      </AppShell>
    );
  }

  const displayName = user.profile?.full_name?.trim() || user.username;
  const initials = getInitials(displayName);
  const avatarSrc = avatarPreview ?? avatarQuery.data ?? null;
  const identity = roleIdentity(user);

  return (
    <AppShell activeNavPath="profile">
      {/* Header Profil */}
      <section className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-space-lg shadow-sm mb-space-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-space-lg">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary font-bold text-2xl sm:text-3xl shadow-md overflow-hidden border-4 border-surface-container">
              {avatarSrc ? (
                <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span aria-hidden="true">{initials}</span>
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
              className="sr-only"
              onChange={handleAvatarSelected}
            />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                {displayName}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-sm text-[11px] font-bold uppercase tracking-wider border border-tertiary/20">
                {user.status === 'ACTIVE' ? 'AKTIF' : user.status}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-container/30 text-primary font-label-sm text-[11px] font-bold uppercase tracking-wider border border-primary/20">
                {sessionRole}
              </span>
            </div>
            {identity && (
              <p className="font-mono text-body-md text-on-surface-variant font-medium mb-2">{identity}</p>
            )}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-space-sm text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
                {user.email}
              </span>
              <span aria-hidden="true">&bull;</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">alternate_email</span>
                @{user.username}
              </span>
            </div>
          </div>

          <div className="self-center sm:self-start">
            <label
              htmlFor="avatar-upload-input-btn"
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-label-md font-semibold transition-all border border-outline-variant/30 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                {uploadAvatarMutation.isPending ? 'progress_activity' : 'upload'}
              </span>
              <span>{uploadAvatarMutation.isPending ? 'Mengunggah…' : 'Unggah Foto Baru'}</span>
            </label>
            <input
              id="avatar-upload-input-btn"
              type="file"
              accept=".jpg,.jpeg,.png"
              className="sr-only"
              onChange={handleAvatarSelected}
            />
            <p className="text-[11px] text-outline text-center mt-1">Maks. 2MB (.jpg, .png)</p>
          </div>
        </div>

        {avatarNotice && (
          <div className="mt-space-md">
            <Alert variant={avatarNotice.variant}>{avatarNotice.text}</Alert>
          </div>
        )}
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-space-sm border-b border-outline-variant/30 mb-space-lg" role="tablist" aria-label="Bagian profil">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'biodata'}
          onClick={() => setActiveTab('biodata')}
          className={`pb-3 px-space-sm font-label-md text-label-md font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'biodata' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
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
          role="tab"
          aria-selected={activeTab === 'keamanan'}
          onClick={() => setActiveTab('keamanan')}
          className={`pb-3 px-space-sm font-label-md text-label-md font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'keamanan' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">lock_reset</span>
          <span>Keamanan &amp; Kata Sandi</span>
          {activeTab === 'keamanan' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* TAB 1: BIODATA */}
      {activeTab === 'biodata' && (
        <form
          onSubmit={biodataForm.handleSubmit((values) => {
            setBiodataNotice(null);
            updateProfileMutation.mutate(values);
          })}
          className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-space-lg shadow-sm"
          noValidate
        >
          {biodataNotice && (
            <div className="mb-space-md">
              <Alert variant="success">{biodataNotice}</Alert>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg mb-space-lg">
            <div>
              <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                Nomor Identitas Resmi (NIM / NIDN / NIP)
              </label>
              <input
                type="text"
                readOnly
                value={user.mahasiswa?.nim ?? user.dosen?.nidn ?? user.dosen?.nip ?? '—'}
                aria-readonly="true"
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface-variant font-mono text-body-md cursor-not-allowed"
              />
              <span className="text-[11px] text-outline mt-1 block">
                Dikelola langsung oleh Pusat Kampus (Read-only).
              </span>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                Email Resmi Terdaftar
              </label>
              <input
                type="email"
                readOnly
                value={user.email}
                aria-readonly="true"
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container-high border border-outline-variant/20 text-on-surface-variant font-body-md cursor-not-allowed"
              />
              <span className="text-[11px] text-tertiary mt-1 block">
                Email terverifikasi untuk notifikasi sistem.
              </span>
            </div>

            <Input
              label="Nama Lengkap"
              placeholder="Nama lengkap sesuai identitas"
              error={biodataForm.formState.errors.full_name?.message}
              {...biodataForm.register('full_name')}
            />

            <Input
              label="Nomor WhatsApp / Telepon"
              type="tel"
              placeholder="cth: 08123456789"
              error={biodataForm.formState.errors.phone?.message}
              {...biodataForm.register('phone')}
            />

            <div className="md:col-span-2">
              <label htmlFor="input-bio" className="block font-label-md text-label-md text-on-surface font-semibold mb-1">
                Bio / Informasi Singkat
              </label>
              <textarea
                id="input-bio"
                rows={3}
                placeholder="Ceritakan singkat tentang Anda (maks. 500 karakter)"
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary font-body-md resize-none"
                {...biodataForm.register('bio')}
              />
              {biodataForm.formState.errors.bio && (
                <p role="alert" className="text-error font-body-sm text-body-sm mt-1">
                  {biodataForm.formState.errors.bio.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-outline-variant/20">
            <Button type="submit" loading={updateProfileMutation.isPending}>
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Simpan Perubahan Biodata</span>
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: KEAMANAN */}
      {activeTab === 'keamanan' && (
        <form
          onSubmit={passwordForm.handleSubmit((values) =>
            changePasswordMutation.mutate({
              oldPassword: values.oldPassword,
              newPassword: values.newPassword,
            })
          )}
          className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-space-lg shadow-sm max-w-2xl"
          noValidate
        >
          <Alert variant="info" className="mb-space-lg">
            Setelah kata sandi berhasil diubah, seluruh sesi aktif dicabut dan Anda perlu masuk kembali
            dengan kata sandi baru.
          </Alert>

          <div className="flex flex-col gap-space-md mb-space-lg">
            <Input
              label="Kata Sandi Saat Ini"
              type="password"
              autoComplete="current-password"
              placeholder="Masukkan kata sandi lama"
              error={passwordForm.formState.errors.oldPassword?.message}
              {...passwordForm.register('oldPassword')}
            />

            <Input
              label="Kata Sandi Baru"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter kombinasi"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />

            {newPasswordValue && (
              <div className="flex flex-col gap-1 -mt-2">
                <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant">Kekuatan Sandi:</span>
                  <span className="font-semibold text-on-surface">{strength.label}</span>
                </div>
              </div>
            )}

            <Input
              label="Konfirmasi Kata Sandi Baru"
              type="password"
              autoComplete="new-password"
              placeholder="Ketik ulang kata sandi baru"
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-outline-variant/20">
            <Button type="submit" loading={changePasswordMutation.isPending}>
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Perbarui Kata Sandi</span>
            </Button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
