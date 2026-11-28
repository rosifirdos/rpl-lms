/**
 * components/ui/Modal.tsx
 *
 * Dialog modal UI kit terpusat: scrim, Escape untuk menutup, fokus terjebak
 * pada konten, dan atribut ARIA dialog.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Cegah penutupan via scrim/Escape (untuk aksi destruktif bertahap). */
  dismissable?: boolean;
  className?: string;
}

export function Modal({ open, onClose, title, children, footer, dismissable = true, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissable) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Pindahkan fokus ke panel agar navigasi keyboard konsisten.
    panelRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, dismissable, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm"
      onClick={() => dismissable && onClose()}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'w-full max-w-lg rounded-2xl bg-surface-container-high shadow-2xl border border-outline-variant/20',
          'focus:outline-2 focus:outline-primary',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-space-lg pt-space-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">{title}</h2>
            {dismissable && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup dialog"
                className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>
        )}
        <div className="px-space-lg py-space-md font-body-md text-body-md text-on-surface-variant">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-space-lg pb-space-lg">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
