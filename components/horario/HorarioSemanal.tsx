'use client';

import { COLOR_ARTEFACTO, DIAS_CORTOS, DIAS_LARGOS, NOMBRE_CORTO } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { horaSemana, rangoSesion } from '@/lib/format';
import { artefactosDesplazables, bloqueDeHora, sesiones } from '@/lib/horario';
import type { Tarea } from '@/types/api';

interface Props {
  tareas: Tarea[];
  /** Hora de inicio (0–167) de cada tarea en el horario propuesto; null = solo el habitual. */
  inicios: number[] | null;
  mostrarHabitual?: boolean;
  /** Anima el desplazamiento de las barras (se desactiva con movimiento reducido por CSS). */
  animar?: boolean;
}

const ALTO_CARRIL = 8;
const SEPARACION = 3;
const MARCAS = [0, 6, 12, 18, 24];

/**
 * Horario semanal: una fila por día (lunes a domingo) y 24 h en el eje horizontal. Cada
 * artefacto desplazable ocupa un carril dentro de la fila. La franja punta (18:00–23:00) se
 * sombrea. El horario habitual aparece como contorno discontinuo.
 */
export function HorarioSemanal({ tareas, inicios, mostrarHabitual = true, animar = true }: Props) {
  const artefactos = artefactosDesplazables(tareas);
  const carril = new Map(artefactos.map((a, i) => [a, i]));
  const altoFila = artefactos.length * (ALTO_CARRIL + SEPARACION) + SEPARACION * 2;
  const habituales = sesiones(
    tareas,
    tareas.map((t) => t.habitual),
  );
  const propuestas = inicios ? sesiones(tareas, inicios) : [];

  const barra = (s: (typeof habituales)[number], tipo: 'habitual' | 'propuesta') => {
    const color = COLOR_ARTEFACTO[s.artefacto] ?? 'rgb(var(--accent))';
    const fin = Math.min(s.hora + s.duracion, 24);
    return (
      <div
        key={`${tipo}-${s.indice}`}
        title={`${s.artefacto} · sesión ${s.sesion} · ${DIAS_LARGOS[s.dia]} ${rangoSesion(s.inicio, s.duracion)} · ${s.potencia_w} W${tipo === 'habitual' ? ' (habitual)' : ''}`}
        className={cn(
          'absolute rounded-full',
          animar && 'transition-[left] duration-300 ease-salida',
        )}
        style={{
          left: `${(s.hora / 24) * 100}%`,
          width: `calc(${((fin - s.hora) / 24) * 100}% - 2px)`,
          top: SEPARACION + (carril.get(s.artefacto) ?? 0) * (ALTO_CARRIL + SEPARACION),
          height: ALTO_CARRIL,
          ...(tipo === 'propuesta'
            ? { backgroundColor: color }
            : { border: `1.5px dashed ${color}`, opacity: inicios ? 0.75 : 1 }),
        }}
      />
    );
  };

  return (
    <div>
      <div className="flex">
        <div className="w-10 shrink-0" />
        <div className="relative h-5 flex-1 text-xs text-ink-faint">
          {MARCAS.map((h) => (
            <span
              key={h}
              className="num absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
              style={{ left: `${(h / 24) * 100}%` }}
            >
              {String(h).padStart(2, '0')}:00
            </span>
          ))}
        </div>
      </div>
      <div
        role="img"
        aria-label="Horario semanal de los electrodomésticos desplazables; el detalle está en la tabla de sesiones."
      >
        {DIAS_CORTOS.map((dia, d) => (
          <div key={dia} className="flex items-center border-t border-border first:border-t-0">
            <div className="w-10 shrink-0 text-xs font-medium text-ink-muted">{dia}</div>
            <div className="relative flex-1" style={{ height: altoFila }}>
              {/* Franja punta 18:00–23:00 */}
              <div
                aria-hidden="true"
                className="absolute inset-y-0 bg-warning/10"
                style={{ left: `${(18 / 24) * 100}%`, width: `${(5 / 24) * 100}%` }}
              />
              {/* Rejilla cada 6 h */}
              {[6, 12, 18].map((h) => (
                <div
                  key={h}
                  aria-hidden="true"
                  className="absolute inset-y-0 w-px bg-border"
                  style={{ left: `${(h / 24) * 100}%` }}
                />
              ))}
              {mostrarHabitual
                ? habituales.filter((s) => s.dia === d).map((s) => barra(s, 'habitual'))
                : null}
              {propuestas.filter((s) => s.dia === d).map((s) => barra(s, 'propuesta'))}
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted">
        {artefactos.map((a) => (
          <li key={a} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2 w-4 rounded-full"
              style={{ backgroundColor: COLOR_ARTEFACTO[a] }}
            />
            {NOMBRE_CORTO[a] ?? a}
          </li>
        ))}
        {inicios && mostrarHabitual ? (
          <li className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2 w-4 rounded-full border-[1.5px] border-dashed border-ink-faint"
            />
            Habitual
          </li>
        ) : null}
        <li className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-4 bg-warning/20" />
          Punta 18:00–23:00
        </li>
      </ul>
    </div>
  );
}

/** Tabla accesible con el detalle de cada sesión: habitual frente a propuesta. */
export function TablaSesiones({ tareas, inicios }: { tareas: Tarea[]; inicios: number[] | null }) {
  const nombreBloque = { base: 'Base', media: 'Media', punta: 'Punta' } as const;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Sesiones desplazables: hora habitual y hora propuesta</caption>
        <thead>
          <tr className="border-b border-border text-xs text-ink-muted">
            <th scope="col" className="py-2 pr-3 font-medium">
              Artefacto
            </th>
            <th scope="col" className="py-2 pr-3 font-medium">
              Sesión
            </th>
            <th scope="col" className="py-2 pr-3 font-medium">
              Habitual
            </th>
            <th scope="col" className="py-2 pr-3 font-medium">
              Propuesta
            </th>
            <th scope="col" className="py-2 font-medium">
              Bloque
            </th>
          </tr>
        </thead>
        <tbody>
          {tareas.map((t, i) => {
            const propuesta = inicios ? inicios[i] : null;
            const cambio = propuesta !== null && propuesta !== t.habitual;
            return (
              <tr key={t.indice} className="border-b border-border last:border-b-0">
                <td className="py-1.5 pr-3 text-ink">
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: COLOR_ARTEFACTO[t.artefacto] }}
                    />
                    {NOMBRE_CORTO[t.artefacto] ?? t.artefacto}
                  </span>
                </td>
                <td className="num py-1.5 pr-3 text-ink-muted">{t.sesion}</td>
                <td className="num py-1.5 pr-3 text-ink-muted">
                  {horaSemana(t.habitual)} · {nombreBloque[bloqueDeHora(t.habitual)]}
                </td>
                <td
                  className={cn(
                    'num py-1.5 pr-3',
                    cambio ? 'font-medium text-ink' : 'text-ink-muted',
                  )}
                >
                  {propuesta === null ? '-' : horaSemana(propuesta)}
                </td>
                <td className="py-1.5 text-ink-muted">
                  {propuesta === null ? '-' : nombreBloque[bloqueDeHora(propuesta)]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
