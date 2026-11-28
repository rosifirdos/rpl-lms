/**
 * components/ui/Pagination.tsx
 *
 * Kontrol pagination UI kit terpusat; dipakai bersama `meta` envelope
 * backend (`page`, `limit`, `total`, `totalPages`).
 */

import { cn } from '../../utils/cn';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, total, onChange, className }: PaginationProps) {
  if (totalPages <= 0) return null;

  return (
    <nav aria-label="Navigasi halaman" className={cn('flex items-center justify-between gap-4 py-3', className)}>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Halaman {page} dari {totalPages}
        {typeof total === 'number' ? ` • ${total} data` : ''}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outlined"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          Sebelumnya
        </Button>
        <Button
          variant="outlined"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
        >
          Berikutnya
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </Button>
      </div>
    </nav>
  );
}
