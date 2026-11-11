import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type Tono = 'exito' | 'aviso' | 'peligro' | 'acento' | 'neutro';

const FONDO: Record<Tono, string> = {
  exito: 'bg-success/15',
  aviso: 'bg-warning/15',
  peligro: 'bg-danger/15',
  acento: 'bg-accent-tint/50',
  neutro: 'bg-surface-sunken',
};
const PUNTO: Record<Tono, string> = {
  exito: 'bg-success',
  aviso: 'bg-warning',
  peligro: 'bg-danger',
  acento: 'bg-accent',
  neutro: 'bg-ink-faint',
};

/** Badge con fondo suave, texto ink y un punto de color. El estado nunca se comunica solo con color. */
export function Badge({
  tono = 'neutro',
  children,
  className,
}: {
  tono?: Tono;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-ink',
        FONDO[tono],
        className,
      )}
    >
      <span aria-hidden="true" className={cn('h-2 w-2 rounded-full', PUNTO[tono])} />
      {children}
    </span>
  );
}
