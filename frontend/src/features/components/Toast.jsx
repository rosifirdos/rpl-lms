import React from 'react';

/**
 * Toast - Shared toast notification component
 * Used by admin features for consistent notification display
 */
export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-surface-container-highest text-on-surface px-space-md py-space-sm rounded-xl shadow-2xl border border-primary/40 animate-in slide-in-from-bottom-4 duration-200"
    >
      <span className="material-symbols-outlined text-primary text-[20px]">info</span>
      <span className="font-label-md text-sm">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 text-on-surface-variant hover:text-on-surface p-0.5 rounded"
        aria-label="Tutup notifikasi"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}