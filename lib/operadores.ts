import type { Operador } from '@/types/api';

export type Origen = 'p1' | 'p2' | 'mutado';

/** Parámetros que devuelve el backend en `detalle` según el operador. */
export interface DetalleOperador {
  corte?: number;
  corte1?: number;
  corte2?: number;
  mascara?: boolean[];
  gen?: number;
  valor_anterior?: number;
  valor_nuevo?: number;
}

/**
 * De qué padre viene cada gen de cada hijo (solo para colorear la vista; el cruce lo hace el
 * backend). Un punto: el hijo 1 toma la cabeza del padre 1 y la cola del padre 2 desde el corte.
 * Dos puntos: intercambia el segmento [corte1, corte2). Uniforme: intercambia donde la máscara es
 * verdadera. Mutación: un único hijo con un gen cambiado.
 */
export function origenGenes(operador: Operador, detalle: DetalleOperador, n: number): Origen[][] {
  const indices = Array.from({ length: n }, (_, j) => j);
  if (operador === 'mutacion') {
    return [indices.map((j) => (j === detalle.gen ? 'mutado' : 'p1'))];
  }
  let intercambia: (j: number) => boolean;
  if (operador === 'un_punto') {
    const corte = detalle.corte ?? n;
    intercambia = (j) => j >= corte;
  } else if (operador === 'dos_puntos') {
    const a = detalle.corte1 ?? n;
    const b = detalle.corte2 ?? n;
    intercambia = (j) => j >= a && j < b;
  } else {
    const mascara = detalle.mascara ?? [];
    intercambia = (j) => Boolean(mascara[j]);
  }
  return [
    indices.map((j) => (intercambia(j) ? 'p2' : 'p1')),
    indices.map((j) => (intercambia(j) ? 'p1' : 'p2')),
  ];
}

/** Posiciones (entre genes) donde se dibuja una línea de corte. */
export function posicionesCorte(operador: Operador, detalle: DetalleOperador): number[] {
  if (operador === 'un_punto' && detalle.corte !== undefined) return [detalle.corte];
  if (operador === 'dos_puntos' && detalle.corte1 !== undefined && detalle.corte2 !== undefined) {
    return [detalle.corte1, detalle.corte2];
  }
  return [];
}
