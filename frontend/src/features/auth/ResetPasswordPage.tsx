/**
 * features/auth/ResetPasswordPage.tsx
 *
 * Halaman atur ulang kata sandi dari tautan email (FR-003):
 * - Token dibaca dari query `?token=...` (URL yang dibangun backend).
 * - Validitas token dicek via `POST /auth/reset-password/validate` (R-13).
 * - Form kata sandi baru + konfirmasi (zod: min 8, harus cocok).
 * - Sukses → `/login?reset=1`; token invalid/kedaluwarsa → status error
 *   dengan tautan mengulang proses pemulihan.
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../services/endpoints/auth';
import { newPasswordSchema, type NewPasswordFormValues } from '../../lib/validation';
import { Button, Input, Alert } from '../../components/ui';
import { HttpApiError } from '../../types/api';
import { formatDateTimeWithZone } from '../../lib/format';
import ThemeToggle from '../../components/ThemeToggle';

type Phase = 'validating' | 'invalid' | 'ready' | 'submitting' | 'success';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [phase, setPhase] = useState<Phase>(token ? 'validating' : 'invalid');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  });

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setPhase('invalid');
      return undefined;
    }

    (async () => {
      try {
        const result = await authApi.validateResetToken(token);
        if (cancelled) return;
        if (result.valid) {
          setExpiresAt(result.expires_at);
          setPhase('ready');
        } else {
          setPhase('invalid');
        }
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error instanceof HttpApiError ? error.message : 'Token tidak dapat divalidasi.');
        setPhase('invalid');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const onSubmit = async (values: NewPasswordFormValues) => {
    setErrorMessage('');
    try {
      await authApi.resetPassword({ token, new_password: values.new_password });
      setPhase('success');
      // Backend mencabut seluruh refresh token aktif; arahkan ke login.
      setTimeout(() => navigate('/login?reset=1', { replace: true }), 1800);
    } catch (error) {
      const apiError = error instanceof HttpApiError ? error : null;
      setErrorMessage(apiError?.message || 'Gagal mengatur ulang kata sandi. Coba lagi.');
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-gutter">
      <div className="absolute top-space-md right-gutter">
        <ThemeToggle variant="labeled" />
      </div>

      <div className="w-full max-w-md bg-surface-container-low rounded-2xl shadow-xl border border-outline-variant/20 p-space-xl">
        <div className="text-center mb-space-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-on-primary-container">key</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Atur Ulang Kata Sandi</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Pilih kata sandi baru untuk akun E-Learning Kampus Anda.
          </p>
        </div>

        {phase === 'validating' && (
          <div role="status" className="flex flex-col items-center gap-3 py-space-lg">
            <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-hidden="true" />
            <p className="font-body-md text-body-md text-on-surface-variant">Memeriksa keabsahan token…</p>
          </div>
        )}

        {phase === 'invalid' && (
          <div className="flex flex-col gap-space-md">
            <Alert variant="error" title="Token tidak valid">
              {errorMessage || 'Tautan pemulihan tidak valid, telah digunakan, atau kedaluwarsa.'}
            </Alert>
            <Button fullWidth onClick={() => navigate('/forgot-password')}>
              Ajukan Tautan Pemulihan Baru
            </Button>
          </div>
        )}

        {phase === 'ready' && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-space-md" noValidate>
            {expiresAt && (
              <Alert variant="info">
                Tautan berlaku hingga {formatDateTimeWithZone(expiresAt)} dan hanya dapat dipakai satu kali.
              </Alert>
            )}
            {errorMessage && (
              <Alert variant="error">{errorMessage}</Alert>
            )}
            <Input
              label="Kata Sandi Baru"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              error={errors.new_password?.message}
              {...register('new_password')}
            />
            <Input
              label="Konfirmasi Kata Sandi Baru"
              type="password"
              autoComplete="new-password"
              placeholder="Ulangi kata sandi baru"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />
            <Button type="submit" fullWidth size="lg" loading={isSubmitting} className="mt-2">
              {isSubmitting ? 'Menyimpan…' : 'Simpan Kata Sandi Baru'}
            </Button>
          </form>
        )}

        {phase === 'success' && (
          <Alert variant="success" title="Kata sandi berhasil diubah">
            Semua sesi aktif telah dicabut. Anda akan diarahkan ke halaman masuk…
            <div className="mt-2">
              <Link to="/login?reset=1" className="text-primary font-semibold hover:underline">
                Masuk sekarang
              </Link>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
}
