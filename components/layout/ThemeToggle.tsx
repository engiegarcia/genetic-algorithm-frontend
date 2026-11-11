'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Luna, Sol } from '@/components/icons/glifos';
import { EASE } from '@/lib/constants';

const CLASES = 'inline-flex h-10 w-10 items-center justify-center rounded-md';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const reducido = useReducedMotion();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // Antes de montar se reserva un placeholder del mismo tamaño: sin salto de layout.
  if (!montado)
    return <span aria-hidden="true" className={`${CLASES} border border-transparent`} />;

  const oscuro = resolvedTheme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(oscuro ? 'light' : 'dark')}
      aria-label={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className={`${CLASES} border border-transparent text-ink-muted transition-[transform,background-color,color] duration-150 ease-salida hover:bg-surface-sunken hover:text-ink active:scale-[0.97]`}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={oscuro ? 'luna' : 'sol'}
            initial={{ opacity: 0, rotate: reducido ? 0 : -60 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: reducido ? 0 : 60 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="flex"
          >
            {oscuro ? <Luna /> : <Sol />}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
