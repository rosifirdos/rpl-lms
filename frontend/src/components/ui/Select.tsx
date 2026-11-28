/**
 * components/ui/Select.tsx
 *
 * Dropdown pilihan UI kit terpusat dengan label & pesan error.
 */

import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, helperText, options, placeholder, className, id: idProp, required, ...rest },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const messageId = `${id}-message`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="font-label-md text-label-md text-on-surface-variant">
          {label}
          {required && <span aria-hidden="true" className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helperText ? messageId : undefined}
          className={cn(
            'w-full h-11 rounded-xl bg-surface-container-low border px-3.5 pr-9 font-body-md text-body-md text-on-surface appearance-none',
            'transition-colors focus:outline-2 focus:outline-primary',
            'disabled:opacity-50 disabled:bg-surface-container',
            error ? 'border-error' : 'border-outline-variant hover:border-on-surface-variant',
            className
          )}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]"
        >
          expand_more
        </span>
      </div>
      {(error || helperText) && (
        <p
          id={messageId}
          role={error ? 'alert' : undefined}
          className={cn('font-body-sm text-body-sm', error ? 'text-error' : 'text-on-surface-variant')}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});
