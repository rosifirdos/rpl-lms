/**
 * components/ui/Badge.tsx
 *
 * Label status UI kit terpusat dengan varian semantik token desain.
 */

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
  primary: 'bg-primary-container text-on-primary-container border-primary/30',
  success: 'bg-success-soft text-success-ink border-success-border',
  warning: 'bg-warning-soft text-warning-ink border-warning-border',
  danger: 'bg-danger-soft text-danger-ink border-danger-border',
  info: 'bg-info-soft text-info-ink border-info-border',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-label-sm text-label-sm font-semibold whitespace-nowrap',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
