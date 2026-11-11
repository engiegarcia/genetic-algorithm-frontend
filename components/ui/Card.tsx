'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { HTMLAttributes, ReactNode } from 'react';
import { EASE } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  titulo?: ReactNode;
  acciones?: ReactNode;
  /** Solo las cards interactivas suben a border-strong en hover. */
  interactiva?: boolean;
  /** Entrada: opacity 0 a 1 y y 8 a 0. `retraso` en segundos para el escalonado de la primera carga. */
  aparecer?: boolean;
  retraso?: number;
}

export function Card({
  titulo,
  acciones,
  interactiva = false,
  aparecer = false,
  retraso = 0,
  className,
  children,
  ...resto
}: CardProps) {
  const reducido = useReducedMotion();
  const clases = cn(
    'rounded-lg border border-border bg-surface/80 p-4',
    'transition-colors duration-150 ease-salida',
    interactiva && 'hover:border-border-strong',
    className,
  );
  const contenido = (
    <>
      {titulo || acciones ? (
        <header className="mb-3 flex items-start justify-between gap-3">
          {titulo ? <h2 className="text-sm font-semibold text-ink">{titulo}</h2> : <span />}
          {acciones}
        </header>
      ) : null}
      {children}
    </>
  );

  if (!aparecer) {
    return (
      <section className={clases} {...resto}>
        {contenido}
      </section>
    );
  }
  // Con movimiento reducido solo hay un fade corto, sin transform.
  return (
    <motion.section
      className={clases}
      initial={{ opacity: 0, y: reducido ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducido ? 0.15 : 0.35, ease: EASE, delay: reducido ? 0 : retraso }}
      {...(resto as object)}
    >
      {contenido}
    </motion.section>
  );
}
