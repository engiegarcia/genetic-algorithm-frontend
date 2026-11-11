'use client';

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { EASE_CSS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { Chevron } from '@/components/icons/glifos';

interface ColapsableProps {
  children: ReactNode;
  /** Alto máximo (px) del contenido colapsado. */
  alturaMax?: number;
  /**
   * Cambia cuando cambian los datos de dentro. Mientras los datos cambian, el contenedor crece
   * libre (sin max-height ni transition) para que nada salte.
   */
  claveDatos: string;
  /** true mientras hay una petición en curso o el usuario arrastra un control. */
  pendiente?: boolean;
  etiquetaMas?: string;
  etiquetaMenos?: string;
  className?: string;
}

/**
 * "Mostrar más / Mostrar menos" con regla anti-salto. Medir el desbordamiento y aplicar la
 * restricción son dos estados separados:
 *   1. Con datos cambiando: sin max-height ni transition, crece libre.
 *   2. Un frame después de que los datos se estabilizan (requestAnimationFrame): se mide el
 *      contenido y recién entonces se activa max-height con su transición.
 * Así un slider que añade o quita filas no provoca animaciones de altura ni saltos de scroll.
 */
export function Colapsable({
  children,
  alturaMax = 288,
  claveDatos,
  pendiente = false,
  etiquetaMas = 'Mostrar más',
  etiquetaMenos = 'Mostrar menos',
  className,
}: ColapsableProps) {
  const idRegion = useId();
  const interior = useRef<HTMLDivElement>(null);
  const [expandido, setExpandido] = useState(false);
  const [restringido, setRestringido] = useState(false);
  const [alturaTotal, setAlturaTotal] = useState(0);

  useEffect(() => {
    // Datos en movimiento: libera la restricción de inmediato, sin transición.
    setRestringido(false);
    if (pendiente) return;
    const frame = requestAnimationFrame(() => {
      const alto = interior.current?.offsetHeight ?? 0;
      setAlturaTotal(alto);
      setRestringido(alto > alturaMax);
    });
    return () => cancelAnimationFrame(frame);
  }, [claveDatos, pendiente, alturaMax]);

  const alternar = useCallback(() => setExpandido((v) => !v), []);
  const colapsado = restringido && !expandido;

  return (
    <div className={cn('sin-ancla', className)}>
      <div
        id={idRegion}
        className={restringido ? 'overflow-hidden' : undefined}
        style={
          restringido
            ? {
                maxHeight: expandido ? alturaTotal : alturaMax,
                transition: `max-height 280ms ${EASE_CSS}`,
                // Máscara de desvanecimiento inferior: no depende del color de fondo del contenedor.
                maskImage: colapsado
                  ? 'linear-gradient(to bottom, black calc(100% - 48px), transparent)'
                  : undefined,
                WebkitMaskImage: colapsado
                  ? 'linear-gradient(to bottom, black calc(100% - 48px), transparent)'
                  : undefined,
              }
            : undefined
        }
      >
        <div ref={interior}>{children}</div>
      </div>
      {restringido ? (
        <button
          type="button"
          onClick={alternar}
          aria-expanded={expandido}
          aria-controls={idRegion}
          className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-accent transition-colors duration-150 hover:bg-accent-tint/50"
        >
          {expandido ? etiquetaMenos : etiquetaMas}
          <Chevron
            size={16}
            className={cn(
              'transition-transform duration-300 ease-salida',
              expandido && 'rotate-180',
            )}
          />
        </button>
      ) : null}
    </div>
  );
}
