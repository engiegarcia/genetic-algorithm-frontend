'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Chevron } from '@/components/icons/glifos';
import { EASE } from '@/lib/constants';
import { cn } from '@/lib/cn';

export interface OpcionSelect {
  valor: string;
  etiqueta: string;
}

interface SelectProps {
  etiqueta: string;
  valor: string;
  opciones: OpcionSelect[];
  onChange: (valor: string) => void;
  className?: string;
}

/** Alto aproximado del panel (px): si no cabe debajo y hay más sitio arriba, se abre hacia arriba. */
const ALTO_PANEL = 240;

/**
 * Select propio (patrón "select-only combobox"): el foco se queda en el disparador y la opción
 * activa se anuncia con aria-activedescendant. Teclado: flechas, Home/End, Enter/Espacio, Esc y
 * la inicial escrita. Se cierra con clic fuera. Cerca del borde inferior se abre hacia arriba.
 */
export function Select({ etiqueta, valor, opciones, onChange, className }: SelectProps) {
  const base = useId();
  const idLista = `${base}-lista`;
  const reducido = useReducedMotion();
  const raiz = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [arriba, setArriba] = useState(false);
  const [activa, setActiva] = useState(0);

  const indiceSeleccionado = Math.max(
    0,
    opciones.findIndex((o) => o.valor === valor),
  );
  const seleccionada = opciones[indiceSeleccionado];

  const abrir = useCallback(() => {
    const caja = raiz.current?.getBoundingClientRect();
    if (caja) {
      const debajo = window.innerHeight - caja.bottom;
      setArriba(debajo < ALTO_PANEL && caja.top > debajo);
    }
    setActiva(indiceSeleccionado);
    setAbierto(true);
  }, [indiceSeleccionado]);

  const cerrar = useCallback(() => setAbierto(false), []);

  const elegir = useCallback(
    (indice: number) => {
      onChange(opciones[indice].valor);
      setAbierto(false);
    },
    [onChange, opciones],
  );

  // Clic fuera cierra el panel.
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: MouseEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener('mousedown', alPulsar);
    return () => document.removeEventListener('mousedown', alPulsar);
  }, [abierto]);

  const alTeclear = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = opciones.length;
    if (e.key === 'Escape') {
      if (abierto) {
        e.preventDefault();
        cerrar();
      }
      return;
    }
    if (e.key === 'Tab') {
      cerrar();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!abierto) return abrir();
      setActiva((a) => (e.key === 'ArrowDown' ? Math.min(a + 1, n - 1) : Math.max(a - 1, 0)));
      return;
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      if (!abierto) return abrir();
      setActiva(e.key === 'Home' ? 0 : n - 1);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!abierto) return abrir();
      elegir(activa);
      return;
    }
    // Inicial escrita: salta a la siguiente opción que empieza con esa letra.
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const letra = e.key.toLocaleLowerCase('es');
      for (let paso = 1; paso <= n; paso += 1) {
        const i = (activa + paso) % n;
        if (opciones[i].etiqueta.toLocaleLowerCase('es').startsWith(letra)) {
          if (!abierto) abrir();
          setActiva(i);
          break;
        }
      }
    }
  };

  return (
    <div ref={raiz} className={cn('relative', className)}>
      <button
        type="button"
        role="combobox"
        aria-label={etiqueta}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-activedescendant={abierto ? `${base}-opcion-${activa}` : undefined}
        onClick={() => (abierto ? cerrar() : abrir())}
        onKeyDown={alTeclear}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-surface-sunken px-3 text-sm text-ink',
          'transition-colors duration-150 ease-salida hover:border-border-strong',
          abierto ? 'border-accent' : 'border-border',
        )}
      >
        <span className="truncate">{seleccionada?.etiqueta}</span>
        <Chevron
          size={16}
          className={cn(
            'shrink-0 text-ink-muted transition-transform duration-300 ease-salida',
            abierto && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence>
        {abierto ? (
          <motion.ul
            id={idLista}
            role="listbox"
            aria-label={etiqueta}
            initial={{ opacity: 0, y: reducido ? 0 : arriba ? -6 : 6, scale: reducido ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.18, ease: EASE }}
            className={cn(
              'scroll-panel absolute left-0 z-30 max-h-60 w-full overflow-y-auto rounded-md border border-border-strong',
              'bg-surface-raised p-1 shadow-popover',
              arriba ? 'bottom-full mb-1 origin-bottom' : 'top-full mt-1 origin-top',
            )}
          >
            {opciones.map((o, i) => (
              // El teclado lo gestiona el combobox (foco en el disparador + aria-activedescendant).
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <li
                key={o.valor}
                id={`${base}-opcion-${i}`}
                role="option"
                aria-selected={o.valor === valor}
                onMouseEnter={() => setActiva(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(i)}
                className={cn(
                  'cursor-pointer rounded-md px-2.5 py-2 text-sm text-ink',
                  i === activa && 'bg-accent-tint/50',
                  o.valor === valor && 'font-medium',
                )}
              >
                {o.etiqueta}
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
