import React, { useState, useRef, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChangePasswordModal from '../features/auth/ChangePasswordModal';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../services/api';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    }
  };

  const mainWrapClass = sidebarOpen
    ? 'pl-64 transition-all duration-300'
    : 'pl-0 transition-all duration-300';

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
      />

      {/* RBAC Filtered Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        activeRole={activeRole}
        onRoleChange={onRoleChange}
        activeNavPath={activeNavPath}
        onNavChange={onNavChange}
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
