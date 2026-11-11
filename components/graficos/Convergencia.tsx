'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatEntero, formatNumero } from '@/lib/format';
import { submuestrear } from '@/lib/sse';

export interface SerieConvergencia {
  clave: string;
  nombre: string;
  color: string;
  discontinua?: boolean;
}

interface Props {
  /** Filas con `generacion` y una columna numérica por serie. */
  datos: Record<string, number>[];
  series: SerieConvergencia[];
  objetivoMinimo: number;
  generacionesMax?: number;
  alto?: number;
  /** Límite superior del eje Y (las medias de la población pueden ser muy altas al inicio). */
  techo?: number;
}

const estiloTooltip = {
  background: 'rgb(var(--surface-raised))',
  border: '1px solid rgb(var(--border-strong))',
  borderRadius: 6,
  fontSize: 12,
  color: 'rgb(var(--ink))',
};

/** Curva de convergencia del objetivo f por generación, con la línea del óptimo demostrado. */
export function Convergencia({
  datos,
  series,
  objetivoMinimo,
  generacionesMax,
  alto = 240,
  techo,
}: Props) {
  const reducidos = submuestrear(datos, 600);
  const maximo = Math.max(
    objetivoMinimo,
    ...reducidos.flatMap((fila) =>
      series.map((s) => fila[s.clave]).filter((v) => Number.isFinite(v)),
    ),
  );
  const superior = Math.min(techo ?? Number.POSITIVE_INFINITY, maximo);
  const margen = Math.max((superior - objetivoMinimo) * 0.08, 0.002);
  return (
    <div style={{ height: alto }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={reducidos} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="rgb(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey="generacion"
            type="number"
            domain={[0, generacionesMax ?? 'dataMax']}
            allowDecimals={false}
            tickFormatter={(g: number) => formatEntero(g)}
            tick={{ fontSize: 12, fill: 'rgb(var(--ink-muted))' }}
            tickLine={false}
            axisLine={{ stroke: 'rgb(var(--border))' }}
          />
          <YAxis
            width={52}
            domain={[
              Math.floor((objetivoMinimo - margen) * 1000) / 1000,
              Math.ceil((superior + margen) * 1000) / 1000,
            ]}
            allowDataOverflow
            tickFormatter={(v: number) => formatNumero(v, 3)}
            tick={{ fontSize: 12, fill: 'rgb(var(--ink-muted))' }}
            tickLine={false}
            axisLine={false}
          />
          <ReferenceLine
            y={objetivoMinimo}
            stroke="rgb(var(--success))"
            strokeDasharray="4 4"
            label={{
              value: `Óptimo demostrado ${formatNumero(objetivoMinimo, 4)}`,
              position: 'insideBottomRight',
              fontSize: 11,
              fill: 'rgb(var(--success))',
            }}
          />
          {series.map((s) => (
            <Line
              key={s.clave}
              type="stepAfter"
              dataKey={s.clave}
              name={s.nombre}
              stroke={s.color}
              strokeWidth={s.discontinua ? 1.25 : 1.75}
              strokeDasharray={s.discontinua ? '4 3' : undefined}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          ))}
          <Tooltip
            isAnimationActive={false}
            contentStyle={estiloTooltip}
            labelFormatter={(g: number) => `Generación ${formatEntero(g)}`}
            formatter={(v: number, nombre: string) => [formatNumero(v, 4), nombre]}
          />
          <Legend
            iconType="plainline"
            wrapperStyle={{ fontSize: 12, color: 'rgb(var(--ink-muted))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
