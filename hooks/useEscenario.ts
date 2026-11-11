'use client';

import { useQuery } from '@tanstack/react-query';
import { obtenerEscenario } from '@/lib/api';

export const CLAVE_ESCENARIO = ['escenario'] as const;

/** Datos estáticos del caso de estudio: se piden una vez por sesión. */
export function useEscenario() {
  return useQuery({
    queryKey: CLAVE_ESCENARIO,
    queryFn: ({ signal }) => obtenerEscenario(signal),
    staleTime: Infinity,
    retry: 2,
  });
}
