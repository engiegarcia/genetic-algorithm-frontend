'use client';

import { useEffect, useState } from 'react';
import { EASE_CSS } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface MeterProps {
  valor: number;
  max?: number;
  /** Retraso en segundos (escalonado por índice). */
  retraso?: number;
  /** Si es false, el cambio es instantáneo (p. ej. mientras se arrastra un slider). */
  animar?: boolean;
  /** Clase de color de la barra; por defecto el acento. */
  colorClase?: string;
  className?: string;
  etiqueta?: string;
}

/**
 * Barra de datos: track `surface-sunken` y relleno con transform: scaleX() desde la izquierda
 * (no se anima `width`). Si el valor es mayor que 0 el relleno mide al menos 2 px; si es 0 queda vacío.
 */
export function Meter({
  valor,
  max = 1,
  retraso = 0,
  animar = true,
  colorClase = 'bg-accent',
  className,
  etiqueta,
}: MeterProps) {
  const fraccion = max > 0 ? Math.min(Math.max(valor / max, 0), 1) : 0;
  // 0,015 de un track de al menos ~160 px son 2 px.
  const escala = fraccion === 0 ? 0 : Math.max(fraccion, 0.015);

  // Al montar parte de 0 para que la barra "crezca"; después sigue al valor.
  const [mostrada, setMostrada] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMostrada(escala));
    return () => cancelAnimationFrame(id);
  }, [escala]);

  return (
    <div
      role="meter"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={valor}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-sunken', className)}
    >
      <div
        className={cn('h-full w-full origin-left', colorClase)}
        style={{
          transform: `scaleX(${mostrada})`,
          transition: animar ? `transform 700ms ${EASE_CSS} ${retraso}s` : 'none',
        }}
      />
    </div>
  );
}
