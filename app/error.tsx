'use client';

import { Button } from '@/components/ui/Button';
import { UnPanel } from '@/components/layout/Paneles';

/** Error boundary global: algo falló al renderizar la vista. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <UnPanel ancho="max-w-xl">
      <div role="alert" className="rounded-lg border border-danger/50 bg-surface/80 p-6">
        <h1 className="text-lg font-semibold text-ink">Algo salió mal en esta vista</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Se produjo un error inesperado al mostrar la página. Puedes reintentar; si se repite,
          recarga el navegador.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-ink-faint">
            Referencia: <span className="num text-ink">{error.digest}</span>
          </p>
        ) : null}
        <Button className="mt-4" variante="primario" onClick={reset}>
          Reintentar
        </Button>
      </div>
    </UnPanel>
  );
}
