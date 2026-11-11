import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

type Variante = 'primario' | 'secundario' | 'fantasma';

/** Clases compartidas por <Button> y <EnlaceBoton>, para que un enlace de descarga se vea igual que un botón. */
export function clasesBoton(variante: Variante = 'secundario', extra?: string): string {
  const base =
    'inline-flex h-10 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-medium ' +
    'transition-[transform,background-color,border-color,color,opacity] duration-150 ease-salida ' +
    'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';
  const variantes: Record<Variante, string> = {
    primario: 'bg-accent text-accent-on hover:bg-accent-hover border border-transparent',
    secundario: 'border border-border-strong bg-surface-raised text-ink hover:bg-surface-sunken',
    fantasma: 'border border-transparent text-ink-muted hover:bg-surface-sunken hover:text-ink',
  };
  return cn(base, variantes[variante], extra);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  cargando?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variante = 'secundario',
    cargando = false,
    className,
    children,
    disabled,
    type = 'button',
    ...resto
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={clasesBoton(variante, className)}
      {...resto}
    >
      {cargando ? <Spinner /> : null}
      {children}
    </button>
  );
});

interface EnlaceBotonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variante?: Variante;
}

export function EnlaceBoton({
  variante = 'secundario',
  className,
  children,
  ...resto
}: EnlaceBotonProps) {
  return (
    <a className={clasesBoton(variante, className)} {...resto}>
      {children}
    </a>
  );
}
