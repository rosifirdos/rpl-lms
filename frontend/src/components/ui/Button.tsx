/**
 * components/ui/Button.tsx
 *
 * Tombol UI kit terpusat (Bab 3.7). Memakai token tailwind.config.js,
 * mendukung `disabled`, `aria-*`, focus ring 2px, dan state loading.
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'filled' | 'outlined' | 'text' | 'tonal' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  filled: 'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active',
  tonal: 'bg-secondary-container text-on-secondary-container hover:brightness-95',
  outlined: 'border border-outline text-primary hover:bg-primary/8',
  text: 'text-primary hover:bg-primary/8',
  danger: 'bg-error text-on-error hover:brightness-110',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 gap-1.5 font-label-sm text-label-sm rounded-lg',
  md: 'h-10 px-4 gap-2 font-label-md text-label-md rounded-xl',
  lg: 'h-12 px-6 gap-2 font-label-lg text-label-md rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'filled', size = 'md', loading = false, fullWidth = false, icon, className, children, disabled, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
});
