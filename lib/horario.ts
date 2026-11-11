import type { Bloque, Tarea } from '@/types/api';

export const HORAS_SEMANA = 168;

/** Bloque horario BT5-I de una hora del día (Osinergmin): Base 23–08, Media 08–18, Punta 18–23. */
export function bloqueDeHora(hora: number): Bloque {
  const h = ((hora % 24) + 24) % 24;
  if (h >= 18 && h < 23) return 'punta';
  if (h >= 8 && h < 18) return 'media';
  return 'base';
}

export interface Sesion {
  indice: number;
  artefacto: string;
  sesion: number;
  potencia_w: number;
  inicio: number;
  duracion: number;
  dia: number;
  hora: number;
}

/** Une cada tarea con su hora de inicio (0–167) y la ubica en día y hora. */
export function sesiones(tareas: Tarea[], inicios: number[]): Sesion[] {
  return tareas.map((t, i) => {
    const inicio = inicios[i];
    return {
      indice: t.indice,
      artefacto: t.artefacto,
      sesion: t.sesion,
      potencia_w: t.potencia_w,
      inicio,
      duracion: t.duracion,
      dia: Math.floor(inicio / 24),
      hora: inicio % 24,
    };
  });
}

/** Hora de inicio de cada tarea para un cromosoma (índices dentro de `tarea.inicios`). */
export function decodificar(tareas: Tarea[], cromosoma: number[]): number[] {
  return tareas.map((t, i) => t.inicios[cromosoma[i]]);
}

/** Artefactos desplazables en el orden de las tareas, sin repetir. */
export function artefactosDesplazables(tareas: Tarea[]): string[] {
  return [...new Set(tareas.map((t) => t.artefacto))];
}

/** Energía (kWh) por bloque de un perfil horario en W. */
export function energiaPorBloque(perfil: number[]): Record<Bloque, number> {
  const total: Record<Bloque, number> = { base: 0, media: 0, punta: 0 };
  perfil.forEach((w, t) => {
    total[bloqueDeHora(t)] += w / 1000;
  });
  return total;
}

const dosDigitos = (h: number) => `${String(h).padStart(2, '0')}:00`;

/** «04:00–07:00 y 18:00–22:00» a partir de las horas del día permitidas (ordenadas). */
function rangosDelDia(horas: number[]): string {
  const rangos: [number, number][] = [];
  for (const h of horas) {
    const ultimo = rangos[rangos.length - 1];
    if (ultimo && h === ultimo[1] + 1) ultimo[1] = h;
    else rangos.push([h, h]);
  }
  return rangos
    .map(([a, b]) => (a === b ? dosDigitos(a) : `${dosDigitos(a)}–${dosDigitos(b)}`))
    .join(' y ');
}

/**
 * Describe las horas de inicio permitidas de una sesión agrupando días con el mismo rango:
 * «Lun–Vie 18:00–22:00; Sáb–Dom 08:00–21:00». Las horas son de inicio, no de fin.
 */
export function describirInicios(inicios: number[], diasCortos: readonly string[]): string {
  const porDia = new Map<number, number[]>();
  for (const t of [...inicios].sort((a, b) => a - b)) {
    const d = Math.floor(t / 24);
    porDia.set(d, [...(porDia.get(d) ?? []), t % 24]);
  }
  const grupos: { desde: number; hasta: number; texto: string }[] = [];
  for (const [d, horas] of [...porDia.entries()].sort((a, b) => a[0] - b[0])) {
    const texto = rangosDelDia(horas);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.texto === texto && ultimo.hasta === d - 1) ultimo.hasta = d;
    else grupos.push({ desde: d, hasta: d, texto });
  }
  return grupos
    .map((g) => {
      const dias =
        g.desde === g.hasta ? diasCortos[g.desde] : `${diasCortos[g.desde]}–${diasCortos[g.hasta]}`;
      return `${dias} ${g.texto}`;
    })
    .join('; ');
}
