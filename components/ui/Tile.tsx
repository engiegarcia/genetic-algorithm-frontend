'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Check } from '@/components/icons/glifos';
import { cn } from '@/lib/cn';

interface TileProps {
  titulo: ReactNode;
  descripcion?: ReactNode;
  tag?: ReactNode;
  activo: boolean;
  onClick: () => void;
  /** 'accion': botón con aria-pressed (CasosEjemplo). 'radio': selección exclusiva con aria-checked. */
  modo?: 'accion' | 'radio';
  tabIndex?: number;
  className?: string;
}

/**
 * Tile seleccionable. Inactivo: borde base. Activo: border-strong, tinte muy leve del acento y
 * anillo de 1 px (nunca fondo sólido grande). El check usa un resorte: es el único resorte del proyecto.
 */
export function Tile({
  titulo,
  descripcion,
  tag,
  activo,
  onClick,
  modo = 'accion',
  tabIndex,
  className,
}: TileProps) {
  const reducido = useReducedMotion();
  const semantica =
    modo === 'radio'
      ? { role: 'radio' as const, 'aria-checked': activo }
      : { 'aria-pressed': activo };
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={tabIndex}
      {...semantica}
      className={cn(
        'relative w-full rounded-lg border p-3 pr-10 text-left',
        'transition-[transform,background-color,border-color] duration-150 ease-salida active:scale-[0.98]',
        'hover-escala',
        activo
          ? 'border-border-strong bg-accent-tint/20 ring-1 ring-accent'
          : 'border-border bg-surface/80 hover:border-border-strong',
        className,
      )}
    >
      <span className="block text-sm font-medium text-ink">{titulo}</span>
      {descripcion ? (
        <span className="num mt-0.5 block text-xs text-ink-muted">{descripcion}</span>
      ) : null}
      {tag ? <span className="mt-1.5 block text-xs text-ink-faint">{tag}</span> : null}
      <span
        aria-hidden="true"
        className={cn(
          'absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border',
          activo ? 'border-accent bg-accent text-accent-on' : 'border-border-strong',
        )}
      >
        <AnimatePresence>
          {activo ? (
            <motion.span
              initial={{ scale: reducido ? 1 : 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={
                reducido ? { duration: 0.1 } : { type: 'spring', stiffness: 500, damping: 28 }
              }
              className="flex"
            >
              <Check size={16} />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </button>
  );
}

interface OpcionTile<V extends string> {
  valor: V;
  titulo: ReactNode;
  descripcion?: ReactNode;
}

/** Grupo de selección exclusiva: role="radiogroup", tabindex itinerante y navegación con flechas. */
export function GrupoTiles<V extends string>({
  opciones,
  valor,
  onChange,
  etiqueta,
  className,
}: {
  opciones: OpcionTile<V>[];
  valor: V;
  onChange: (valor: V) => void;
  etiqueta: string;
  className?: string;
}) {
  const contenedor = useRef<HTMLDivElement>(null);

  const alTeclear = (e: KeyboardEvent<HTMLDivElement>) => {
    const siguiente = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (siguiente === undefined) return;
    e.preventDefault();
    const actual = opciones.findIndex((o) => o.valor === valor);
    const destino = (actual + siguiente + opciones.length) % opciones.length;
    onChange(opciones[destino].valor);
    const botones = contenedor.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    botones?.[destino]?.focus();
  };

  return (
    <div
      ref={contenedor}
      role="radiogroup"
      aria-label={etiqueta}
      tabIndex={-1}
      onKeyDown={alTeclear}
      className={cn('grid gap-2', className)}
    >
      {opciones.map((o) => (
        <Tile
          key={o.valor}
          modo="radio"
          titulo={o.titulo}
          descripcion={o.descripcion}
          activo={o.valor === valor}
          tabIndex={o.valor === valor ? 0 : -1}
          onClick={() => onChange(o.valor)}
        />
      ))}
    </div>
  );
}
