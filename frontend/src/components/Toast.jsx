import { } from 'react';

/**
 * Toast notification component
 * @param {Object} props
 * @param {string} props.message - Toast message to display
 * @param {Function} props.onClose - Callback when toast dismisses (manual dismiss)
 */
export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-surface-container-high border border-tertiary/40 text-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4" role="alert" aria-live="polite">
      <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
      <span className="text-sm font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-0.5 rounded hover:bg-surface-container text-on-surface-variant"
        aria-label="Tutup notifikasi"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}