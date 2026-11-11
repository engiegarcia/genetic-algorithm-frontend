'use client';

import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Meter } from '@/components/ui/Meter';
import { formatEntero, formatNumero, formatPct, formatSoles } from '@/lib/format';
import type { Evaluacion } from '@/types/api';

interface Props {
  actual: Evaluacion | null;
  habitual: Evaluacion;
  cotaCosto: number;
  padrMinimo: number;
  objetivoMinimo: number;
  generacion: number | null;
  generacionesMax: number | null;
  factibles: number | null;
  poblacion: number | null;
}

/** Tolerancia para declarar alcanzadas las cotas (los valores llegan como flotantes). */
const TOL = 1e-9;

export function esOptimo(e: Evaluacion, objetivoMinimo: number): boolean {
  return e.factible && e.objetivo <= objetivoMinimo + TOL;
}

function Indicador({
  etiqueta,
  valor,
  detalle,
  destacado = false,
}: {
  etiqueta: string;
  valor: ReactNode;
  detalle?: ReactNode;
  destacado?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface/80 p-3">
      <p className="etiqueta">{etiqueta}</p>
      <p
        className={
          destacado
            ? 'num mt-1 text-xl font-semibold text-ink'
            : 'num mt-1 text-lg font-semibold text-ink'
        }
      >
        {valor}
      </p>
      {detalle ? <p className="num mt-0.5 text-xs text-ink-faint">{detalle}</p> : null}
    </div>
  );
}

/** Indicadores de la mejor solución frente al horario habitual y a las cotas inferiores. */
export function Indicadores({
  actual,
  habitual,
  cotaCosto,
  padrMinimo,
  objetivoMinimo,
  generacion,
  generacionesMax,
  factibles,
  poblacion,
}: Props) {
  const e = actual ?? habitual;
  const ahorro = ((habitual.costo - e.costo) / habitual.costo) * 100;
  const ahorroMaximo = ((habitual.costo - cotaCosto) / habitual.costo) * 100;
  const optimo = actual ? esOptimo(actual, objetivoMinimo) : false;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {actual ? (
          optimo ? (
            <Badge tono="exito">Óptimo demostrado alcanzado</Badge>
          ) : e.factible ? (
            <Badge tono="acento">Factible, aún sobre la cota</Badge>
          ) : (
            <Badge tono="peligro">Infactible: viola {formatNumero(e.violacion_kwh, 1)} kWh</Badge>
          )
        ) : (
          <Badge>Horario habitual (sin ejecutar)</Badge>
        )}
        {generacion !== null && generacionesMax !== null ? (
          <span className="num text-xs text-ink-muted">
            Generación {formatEntero(generacion)} de {formatEntero(generacionesMax)}
            {factibles !== null && poblacion
              ? ` · ${formatEntero(factibles)} de ${formatEntero(poblacion)} factibles`
              : ''}
          </span>
        ) : null}
      </div>
      {generacion !== null && generacionesMax ? (
        <Meter
          valor={generacion}
          max={generacionesMax}
          animar={false}
          etiqueta="Progreso de la ejecución"
        />
      ) : null}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Indicador
          etiqueta="Costo semanal"
          valor={formatSoles(e.costo)}
          detalle={`Habitual ${formatSoles(habitual.costo)} · cota ${formatSoles(cotaCosto)}`}
          destacado
        />
        <Indicador
          etiqueta="Ahorro"
          valor={formatPct(ahorro)}
          detalle={`Máximo posible ${formatPct(ahorroMaximo)}`}
          destacado
        />
        <Indicador
          etiqueta="PADR (pico/promedio)"
          valor={formatNumero(e.padr, 3)}
          detalle={`Pico ${formatEntero(e.pico_w)} W · mínimo ${formatNumero(padrMinimo, 3)}`}
        />
        <Indicador
          etiqueta="Objetivo f"
          valor={formatNumero(e.objetivo, 4)}
          detalle={`Habitual 1,0000 · óptimo ${formatNumero(objetivoMinimo, 4)}`}
        />
      </div>
      <p className="num text-xs text-ink-muted">
        Energía en punta: {formatNumero(e.energia_punta_kwh, 1)} kWh por semana (habitual{' '}
        {formatNumero(habitual.energia_punta_kwh, 1)} kWh).
      </p>
    </div>
  );
}
