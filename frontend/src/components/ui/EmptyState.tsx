/**
 * components/ui/EmptyState.tsx
 *
 * Tampilan kosong terstruktur (G-07) dengan ikon, judul, deskripsi,
 * dan aksi opsional.
 */

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-space-xl px-gutter">
      <div className="w-14 h-14 mb-3 rounded-xl bg-surface-container-high flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="font-title-md text-title-md text-on-surface font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm font-body-md text-body-md text-on-surface-variant">{description}</p>
      )}
      {action && <div className="mt-space-md">{action}</div>}
    </div>
  );
}
