import React, { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const typeConfig = {
    success: {
      bg: 'bg-[#00285d] border-[#4d8eff]/40 text-[#d6e4f9]',
      icon: 'check_circle',
      iconColor: 'text-tertiary',
    },
    error: {
      bg: 'bg-error-container border-error/50 text-on-error-container',
      icon: 'error',
      iconColor: 'text-error',
    },
    warning: {
      bg: 'bg-amber-950/90 border-amber-500/40 text-amber-200',
      icon: 'warning',
      iconColor: 'text-amber-400',
    },
    info: {
      bg: 'bg-surface-container-high border-outline/30 text-on-surface',
      icon: 'info',
      iconColor: 'text-secondary',
    },
  };

  const current = typeConfig[toast.type] || typeConfig.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm px-space-md py-space-sm rounded-xl shadow-2xl border backdrop-blur-md animate-fade-in transition-all">
      <div className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg border shadow-lg ${current.bg}`}>
        <span className={`material-symbols-outlined text-[20px] shrink-0 ${current.iconColor}`}>
          {current.icon}
        </span>
        <span className="font-body-sm text-body-sm leading-tight">{toast.message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 hover:opacity-75 transition-opacity"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
}
