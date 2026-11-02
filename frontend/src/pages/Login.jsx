/**
 * pages/Login.jsx
 *
 * Halaman-level wrapper untuk rute /login.
 * Menggunakan standalone layout tanpa AppShell.
 */
import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage({ onNavigate, onRoleChange }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Mock login - in real app this would call API
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username && password) {
      login({ name: username, role: 'mahasiswa' });
      onNavigate?.('dasbor-mahasiswa');
    } else {
      setError('Username dan password wajib diisi');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-gutter">
      <div className="w-full max-w-md bg-surface-container-low rounded-2xl shadow-xl border border-outline-variant/20 p-space-xl">
        <div className="text-center mb-space-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-on-primary-container">school</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Masuk ke SPADA UPGRIS</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Sistem Pembelajaran Daring FPTIK</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-2" role="alert">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div>
            <label htmlFor="username" className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
              Username / NIM / NIDN
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary font-body-md text-body-md"
              placeholder="cth: dimas.arya"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="font-label-md text-label-md text-on-surface font-semibold block mb-1">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary font-body-md text-body-md"
              placeholder="Masukkan kata sandi"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <div className="mt-space-lg pt-space-lg border-t border-outline-variant/20">
          <p className="font-caption text-caption text-center text-on-surface-variant">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={() => onNavigate?.('forgot-password')}
              className="text-primary hover:underline font-semibold"
            >
              Lupa Kata Sandi
            </button>
          </p>
        </div>

        <div className="mt-space-md p-space-sm rounded-lg bg-surface-container-high text-center">
          <p className="font-caption text-caption text-on-surface-variant">Demo Credentials:</p>
          <p className="font-body-sm text-body-sm text-on-surface font-mono">dimas.arya / UPGRIS#2026Secure!</p>
        </div>
      </div>
    </div>
  );
}