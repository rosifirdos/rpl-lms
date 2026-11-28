/**
 * features/auth/LoginPage.tsx
 *
 * Halaman masuk terhubung `POST /auth/login` (Fase 1):
 * - Identifier tunggal: username / email / NIM / NIDN / NIP.
 * - Show/hide password, remember me (prefill identifier), loading, disable submit.
 * - Error 401 (kredensial salah) & 403 (akun INACTIVE/SUSPENDED) memakai
 *   pesan khusus dari backend.
 * - Notifikasi kontekstual: `?expired=1` (sesi berakhir) dan `?reset=1`
 *   (kata sandi berhasil diatur ulang).
 * - Setelah sukses: kembali ke halaman asal (`location.state.from`) atau
 *   `/dashboard` — dasbor merender komponen sesuai peran sesi.
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { loginSchema, type LoginFormValues } from '../../lib/validation';
import { Button } from '../../components/ui';
import { Input } from '../../components/ui';
import { Alert } from '../../components/ui';
import { HttpApiError } from '../../types/api';
import ThemeToggle from '../../components/ThemeToggle';

const REMEMBER_IDENTIFIER_KEY = 'elearning.identifier';

export default function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [formError, setFormError] = useState('');

  const from = (location.state as { from?: string } | null)?.from;
  const expired = searchParams.get('expired') === '1';
  const resetSuccess = searchParams.get('reset') === '1';
  const passwordChanged = searchParams.get('password_changed') === '1';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  // Prefill identifier bila pengguna memilih "Ingat saya" sebelumnya.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBER_IDENTIFIER_KEY);
      if (saved) {
        setValue('identifier', saved);
        setRemember(true);
      }
    } catch {
      /* localStorage tidak tersedia */
    }
  }, [setValue]);

  // Sudah login? Langsung ke tujuan.
  if (status === 'authenticated' && !expired) {
    return <Navigate to={from ?? '/dashboard'} replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setFormError('');
    try {
      await login(values);
      try {
        if (remember) {
          window.localStorage.setItem(REMEMBER_IDENTIFIER_KEY, values.identifier);
        } else {
          window.localStorage.removeItem(REMEMBER_IDENTIFIER_KEY);
        }
      } catch {
        /* storage tidak tersedia */
      }
      navigate(from ?? '/dashboard', { replace: true });
    } catch (error) {
      const apiError = error instanceof HttpApiError ? error : null;
      if (apiError?.status === 403) {
        // Pesan khusus backend untuk akun INACTIVE/SUSPENDED.
        setFormError(apiError.message);
      } else if (apiError?.status === 401) {
        setFormError(apiError.message || 'Kredensial tidak valid: username/email atau password salah');
      } else if (apiError && apiError.status >= 500) {
        setFormError('Server sedang bermasalah. Coba beberapa saat lagi.');
      } else if (apiError && apiError.status === 0) {
        setFormError('Tidak dapat menghubungi server. Periksa koneksi Anda.');
      } else {
        setFormError(apiError?.message || 'Login gagal. Periksa kredensial Anda.');
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-gutter">
      {/* Pengalih tema untuk halaman standalone (tanpa AppShell/Header) */}
      <div className="absolute top-space-md right-gutter">
        <ThemeToggle variant="labeled" />
      </div>

      <div className="w-full max-w-md bg-surface-container-low rounded-2xl shadow-xl border border-outline-variant/20 p-space-xl">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-label-sm font-semibold text-on-surface-variant hover:text-primary mb-space-md transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Kembali ke Beranda</span>
        </button>

        <div className="text-center mb-space-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-on-primary-container">school</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Masuk ke E-Learning Kampus</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Sistem Pembelajaran Daring</p>
        </div>

        {expired && (
          <Alert variant="warning" className="mb-space-md">
            Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.
          </Alert>
        )}
        {resetSuccess && (
          <Alert variant="success" className="mb-space-md">
            Kata sandi berhasil diatur ulang. Silakan masuk dengan kata sandi baru Anda.
          </Alert>
        )}
        {passwordChanged && (
          <Alert variant="success" className="mb-space-md">
            Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru Anda.
          </Alert>
        )}

        {formError && (
          <div
            className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm flex items-start gap-2"
            role="alert"
          >
            <span className="material-symbols-outlined mt-0.5">error</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-space-md" noValidate>
          <Input
            label="Username / Email / NIM / NIDN / NIP"
            placeholder="cth: dimas.arya atau email kampus"
            autoComplete="username"
            error={errors.identifier?.message}
            {...register('identifier')}
          />

          <Input
            label="Kata Sandi"
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan kata sandi"
            autoComplete="current-password"
            error={errors.password?.message}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            }
            {...register('password')}
          />

          <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant select-none cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant accent-[rgb(var(--primary))]"
            />
            Ingat saya di perangkat ini
          </label>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
            {isSubmitting ? 'Memproses…' : 'Masuk'}
          </Button>
        </form>

        <div className="mt-space-lg pt-space-lg border-t border-outline-variant/20">
          <p className="font-caption text-caption text-center text-on-surface-variant">
            Lupa kata sandi?{' '}
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-primary hover:underline font-semibold"
            >
              Pemulihan Kata Sandi
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
