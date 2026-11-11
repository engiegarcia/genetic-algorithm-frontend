'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DIAS_CORTOS } from '@/lib/constants';
import { formatEntero, horaSemana } from '@/lib/format';

interface Props {
  /** Demanda total (W) por hora de la semana del horario propuesto; null = aún no hay. */
  perfil: number[] | null;
  /** Demanda total del horario habitual. */
  habitual: number[] | null;
  /** Carga no desplazable. */
  fijo: number[];
  limite: number;
  alto?: number;
}

const COLOR_PROPUESTO = 'rgb(var(--accent))';
const COLOR_HABITUAL = 'rgb(var(--ink-faint))';
const COLOR_FIJO = 'rgb(var(--border-strong))';
const TICKS = [0, 24, 48, 72, 96, 120, 144];

/** Perfil horario de la demanda en la semana, con la franja punta sombreada y el límite de 5000 W. */
export function PerfilDemanda({ perfil, habitual, fijo, limite, alto = 240 }: Props) {
  const datos = fijo.map((w, t) => ({
    t,
    fijo: w,
    habitual: habitual?.[t] ?? null,
    propuesto: perfil?.[t] ?? null,
  }));
  const maximo = Math.max(limite, ...fijo, ...(habitual ?? []), ...(perfil ?? []));
  const tope = Math.ceil(maximo / 1000) * 1000 + (maximo % 1000 === 0 ? 1000 : 0);
  const ticksY = Array.from({ length: tope / 1000 + 1 }, (_, i) => i * 1000);
  return (
    <div style={{ height: alto }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="rgb(var(--border))" strokeDasharray="3 3" />
          {DIAS_CORTOS.map((_, d) => (
            <ReferenceArea
              key={d}
              x1={d * 24 + 18}
              x2={d * 24 + 23}
              fill="rgb(var(--warning))"
              fillOpacity={0.1}
              stroke="none"
              ifOverflow="hidden"
            />
          ))}
          <XAxis
            dataKey="t"
            type="number"
            domain={[0, 167]}
            ticks={TICKS}
            tickFormatter={(t: number) => DIAS_CORTOS[Math.floor(t / 24)] ?? ''}
            tick={{ fontSize: 12, fill: 'rgb(var(--ink-muted))' }}
            tickLine={false}
            axisLine={{ stroke: 'rgb(var(--border))' }}
          />
          <YAxis
            width={48}
            domain={[0, tope]}
            tickFormatter={(w: number) => `${formatEntero(w / 1000)} kW`}
            ticks={ticksY}
            tick={{ fontSize: 12, fill: 'rgb(var(--ink-muted))' }}
            tickLine={false}
            axisLine={false}
          />
          <ReferenceLine
            y={limite}
            stroke="rgb(var(--danger))"
            strokeDasharray="4 4"
            label={{
              value: `Límite ${formatEntero(limite)} W`,
              position: 'insideTopRight',
              fontSize: 11,
              fill: 'rgb(var(--danger))',
            }}
          />
          <Area
            type="stepAfter"
            dataKey="fijo"
            name="Carga fija"
            stroke={COLOR_FIJO}
            fill={COLOR_FIJO}
            fillOpacity={0.25}
            strokeWidth={0}
            isAnimationActive={false}
          />
          {habitual ? (
            <Line
              type="stepAfter"
              dataKey="habitual"
              name="Habitual"
              stroke={COLOR_HABITUAL}
              strokeDasharray="4 3"
              strokeWidth={1.25}
              dot={false}
              isAnimationActive={false}
            />
          ) : null}
          {perfil ? (
            <Line
              type="stepAfter"
              dataKey="propuesto"
              name="Propuesto"
              stroke={COLOR_PROPUESTO}
              strokeWidth={1.75}
              dot={false}
              isAnimationActive={false}
            />
          ) : null}
          <Tooltip
            isAnimationActive={false}
            cursor={{ stroke: 'rgb(var(--border-strong))' }}
            contentStyle={{
              background: 'rgb(var(--surface-raised))',
              border: '1px solid rgb(var(--border-strong))',
              borderRadius: 6,
              fontSize: 12,
              color: 'rgb(var(--ink))',
            }}
            labelFormatter={(t: number) => horaSemana(t, true)}
            formatter={(valor: number, nombre: string) => [`${formatEntero(valor)} W`, nombre]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
