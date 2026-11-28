/**
 * components/ui/Alert.tsx
 *
 * Banner informasi UI kit terpusat dengan varian semantik.
 */

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<AlertVariant, { container: string; icon: string; iconText: string }> = {
  info: { container: 'bg-info-soft border-info-border text-info-ink', icon: 'info', iconText: 'text-info-ink' },
  success: { container: 'bg-success-soft border-success-border text-success-ink', icon: 'check_circle', iconText: 'text-success-ink' },
  warning: { container: 'bg-warning-soft border-warning-border text-warning-ink', icon: 'warning', iconText: 'text-warning-ink' },
  error: { container: 'bg-danger-soft border-danger-border text-danger-ink', icon: 'error', iconText: 'text-danger-ink' },
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const styles = variantClasses[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', styles.container, className)}
    >
      <span className={cn('material-symbols-outlined text-[20px] mt-0.5', styles.iconText)} aria-hidden="true">
        {styles.icon}
      </span>
      <div className="font-body-md text-body-md">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
