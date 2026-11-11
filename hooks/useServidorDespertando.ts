'use client';

import { useEffect, useState } from 'react';
import { AVISO_DESPERTAR_MS } from '@/lib/constants';

/** true si `activo` dura más de AVISO_DESPERTAR_MS (el plan gratuito de Render tarda en despertar). */
export function useServidorDespertando(activo: boolean): boolean {
  const [lento, setLento] = useState(false);
  useEffect(() => {
    if (!activo) {
      setLento(false);
      return;
    }
    const id = setTimeout(() => setLento(true), AVISO_DESPERTAR_MS);
    return () => clearTimeout(id);
  }, [activo]);
  return lento;
}
