import { DIAS_CORTOS, DIAS_LARGOS } from '@/lib/constants';

/**
 * Formato numérico con coma decimal (como en el informe). Se arma a mano en lugar de usar
 * Intl para que el resultado no dependa del locale del navegador.
 */
export function formatNumero(valor: number, decimales = 2): string {
  if (!Number.isFinite(valor)) return '-';
  const texto = valor.toFixed(decimales);
  const normalizado = /^-0(\.0+)?$/.test(texto) ? texto.slice(1) : texto;
  const [entero, decimal] = normalizado.split('.');
  return conMiles(entero) + (decimal !== undefined ? `,${decimal}` : '');
}

/** Separador de miles con espacio solo desde 10 000 (criterio del informe: 7542, 10 504). */
function conMiles(entero: string): string {
  const signo = entero.startsWith('-') ? '-' : '';
  const digitos = signo ? entero.slice(1) : entero;
  if (digitos.length <= 4) return entero;
  return signo + digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export const formatEntero = (valor: number): string => formatNumero(valor, 0);
export const formatSoles = (valor: number, decimales = 2): string =>
  `S/ ${formatNumero(valor, decimales)}`;
export const formatPct = (valor: number, decimales = 2): string =>
  `${formatNumero(valor, decimales)} %`;

/** Hora de la semana (0 = lunes 00:00) a «Lun 18:00». */
export function horaSemana(t: number, largo = false): string {
  const dia = Math.floor(t / 24);
  const hora = t % 24;
  const nombre = (largo ? DIAS_LARGOS : DIAS_CORTOS)[dia] ?? '?';
  return `${nombre} ${String(hora).padStart(2, '0')}:00`;
}

/** «18:00–21:00» para una sesión que empieza en `t` y dura `duracion` horas. */
export function rangoSesion(t: number, duracion: number): string {
  const ini = t % 24;
  const fin = (ini + duracion) % 24;
  return `${String(ini).padStart(2, '0')}:00–${String(fin).padStart(2, '0')}:00`;
}

/** Convierte «0,8» o «0.8» en número; NaN si no es válido. */
export function parseNumeroLocal(texto: string): number {
  const limpio = texto.trim().replace(',', '.');
  if (limpio === '' || !/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(limpio)) return Number.NaN;
  return Number(limpio);
}
