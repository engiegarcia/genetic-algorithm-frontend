'use client';

import { Button } from '@/components/ui/Button';
import { codigoError, mensajeError } from '@/lib/errores';

/** Error en línea, sin modales. Muestra también el error_code del backend (500). */
export function EstadoError({
  error,
  onReintentar,
  titulo = 'No se pudo completar la operación',
}: {
  error: unknown;
  onReintentar?: () => void;
  titulo?: string;
}) {
  const codigo = codigoError(error);
  return (
    <div role="alert" className="rounded-lg border border-danger/50 bg-surface/80 p-4">
      <p className="text-sm font-medium text-danger">{titulo}</p>
      <p className="mt-1 text-sm text-ink-muted">{mensajeError(error)}</p>
      {codigo ? (
        <p className="mt-1 text-xs text-ink-faint">
          Código de error: <span className="num text-ink">{codigo}</span>
        </p>
      ) : null}
      {onReintentar ? (
        <Button className="mt-3" onClick={onReintentar}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
