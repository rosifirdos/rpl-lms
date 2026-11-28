/**
 * components/ui/Input.tsx
 *
 * Input teks UI kit terpusat: label, pesan bantu, pesan error per field
 * (pemetaan `errors[].field` dari backend), dan focus ring 2px.
 */

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, trailing, className, id: idProp, required, ...rest },
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
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helperText ? messageId : undefined}
          className={cn(
            'w-full h-11 rounded-xl bg-surface-container-low border px-3.5 font-body-md text-body-md text-on-surface',
            'placeholder:text-on-surface-variant/60 transition-colors',
            'focus:outline-2 focus:outline-offset-0 focus:outline-primary',
            'disabled:opacity-50 disabled:bg-surface-container',
            error ? 'border-error' : 'border-outline-variant hover:border-on-surface-variant',
            trailing && 'pr-10',
            className
          )}
          {...rest}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">{trailing}</div>
        )}
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
