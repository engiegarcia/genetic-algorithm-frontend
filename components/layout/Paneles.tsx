'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { EASE } from '@/lib/constants';

/**
 * Dos paneles (entrada a la izquierda, resultados a la derecha) con scroll independiente,
 * separados con borde y no con gap. En móvil colapsa a una columna con scroll dentro de main.
 */
export function DosPaneles({ izquierda, derecha }: { izquierda: ReactNode; derecha: ReactNode }) {
  const reducido = useReducedMotion();
  return (
    <div className="scroll-panel h-full overflow-y-auto lg:grid lg:grid-cols-[360px_1fr] lg:overflow-hidden">
      <motion.section
        aria-label="Configuración"
        className="scroll-panel border-b border-border p-4 lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-6"
        initial={{ opacity: 0, x: reducido ? 0 : -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reducido ? 0.1 : 0.18, ease: EASE }}
      >
        {izquierda}
      </motion.section>
      <section
        aria-label="Resultados"
        className="scroll-panel relative p-4 lg:h-full lg:overflow-y-auto lg:p-6"
      >
        {derecha}
      </section>
    </div>
  );
}

/** Un solo panel con scroll interno y ancho de lectura acotado (/reglas y /acerca). */
export function UnPanel({
  children,
  ancho = 'max-w-4xl',
  className,
}: {
  children: ReactNode;
  ancho?: string;
  className?: string;
}) {
  return (
    <div className="scroll-panel h-full overflow-y-auto">
      <div className={cn('mx-auto p-4 lg:p-6', ancho, className)}>{children}</div>
    </div>
  );
}
