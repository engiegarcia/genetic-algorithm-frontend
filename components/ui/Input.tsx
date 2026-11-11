import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalido?: boolean;
  /** Conservado para compatibilidad; los valores usan la tipografía general. */
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalido = false, mono = false, className, type = 'text', ...resto },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalido || undefined}
      className={cn(
        'h-10 w-full rounded-md border bg-surface-sunken px-3 text-sm text-ink placeholder:text-ink-faint',
        'transition-colors duration-150 ease-salida',
        'hover:border-border-strong focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50',
        invalido ? 'border-danger' : 'border-border',
        mono && 'num',
        className,
      )}
      {...resto}
    />
  );
});
