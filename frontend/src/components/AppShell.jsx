import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChangePasswordModal from '../features/auth/ChangePasswordModal';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../services/api';

// Di bawah `lg` sidebar tampil sebagai drawer overlay, bukan kolom permanen.
const MOBILE_QUERY = '(max-width: 1023px)';

const getIsMobile = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(MOBILE_QUERY).matches;

/**
 * AppShell — Central Single-Source-of-Truth Layout Shell
 *
 * Menggabungkan Header, Sidebar (RBAC filtered), ChangePasswordModal,
 * Sistem Notifikasi Toast (dengan cleanup ref), dan penanganan sesi logout.
 */
export default function AppShell({
  children,
  activeRole = 'mahasiswa',
  onRoleChange,
  activeNavPath,
  onNavChange,
}) {
  // Di mobile drawer mulai tertutup agar konten tidak tertutup overlay.
  const [sidebarOpen, setSidebarOpen] = useState(() => !getIsMobile());
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Lacak breakpoint: saat masuk/keluar mobile, sidebar kembali ke kondisi
  // netral sehingga tidak "nyangkut" terbuka atau tertutup antar-layout.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mql = window.matchMedia(MOBILE_QUERY);
    const handleChange = (e) => {
      setIsMobile(e.matches);
      setSidebarOpen(!e.matches);
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const showToast = (message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3500);
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout').catch(() => {});
    } finally {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      showToast('Sesi Anda berhasil diakhiri. Token otentikasi telah dibersihkan.');
      if (onNavChange) {
        onNavChange('login');
      } else if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.search = '?page=login';
        window.history.pushState({}, '', url);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  };

  // Di mobile sidebar berupa overlay, jadi konten tidak pernah diberi padding.
  const mainWrapClass =
    sidebarOpen && !isMobile
      ? 'lg:pl-64 transition-all duration-300'
      : 'pl-0 transition-all duration-300';

  // Tutup drawer mobile setiap kali menu dipilih. Di desktop sidebar tetap
  // sebagai kolom permanen sehingga tidak ikut tertutup.
  const handleSidebarNav = (path) => {
    if (isMobile) setSidebarOpen(false);
    if (onNavChange) onNavChange(path);
  };

  // Klik area gelap di luar drawer juga menutupnya (khusus mobile).
  const handleScrimClick = () => {
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-surface-container-highest text-on-surface px-space-md py-space-sm rounded-xl shadow-2xl border border-primary/40 animate-bounce"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-on-surface-variant hover:text-on-surface p-0.5 rounded"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Reusable Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        activeRole={activeRole}
        onRoleChange={onRoleChange}
        onOpenChangePassword={() => setChangePasswordOpen(true)}
        onLogout={handleLogout}
        onNavigate={onNavChange}
      />

      {/* Scrim drawer mobile: tutup saat area gelap diklik */}
      {isMobile && sidebarOpen && (
        <div
          aria-hidden="true"
          onClick={handleScrimClick}
          className="fixed inset-0 top-16 z-30 bg-overlay backdrop-blur-sm lg:hidden"
        />
      )}

      {/* RBAC Filtered Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        activeRole={activeRole}
        onRoleChange={onRoleChange}
        activeNavPath={activeNavPath}
        onNavChange={handleSidebarNav}
      />

      {/* Modal Ubah Kata Sandi */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Konten Utama */}
      <div className={mainWrapClass}>
        <main className="w-full pt-16 px-gutter bg-background min-h-screen">
          <div className="flex flex-col w-full pb-space-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
