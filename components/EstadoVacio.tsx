import type { ReactNode } from 'react';

/** Estado vacío: borde punteado, texto tenue y centrado. */
export function EstadoVacio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border-strong px-6 py-10 text-center">
      <p className="text-sm font-medium text-ink-muted">{titulo}</p>
      {children ? <div className="mt-1 max-w-md text-sm text-ink-faint">{children}</div> : null}
    </div>
  );
}
