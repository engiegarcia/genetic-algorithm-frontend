'use client';

import { useQuery } from '@tanstack/react-query';
import { EstadoError } from '@/components/EstadoError';
import { Meter } from '@/components/ui/Meter';
import { Skeleton } from '@/components/ui/Skeleton';
import { compararTarifas } from '@/lib/api';
import { formatPct, formatSoles } from '@/lib/format';

/**
 * Costo mensual (30 días) con la tarifa horaria BT5-I frente a la tarifa plana BT5B del mismo
 * pliego: horario habitual en ambas y, si ya hay resultado, el horario optimizado con BT5-I.
 */
export function ComparacionTarifas({ cromosoma }: { cromosoma: number[] | null }) {
  const habitual = useQuery({
    queryKey: ['tarifas', 'habitual'],
    queryFn: ({ signal }) => compararTarifas(null, signal),
    staleTime: Infinity,
  });
  const optimizado = useQuery({
    queryKey: ['tarifas', cromosoma],
    queryFn: ({ signal }) => compararTarifas(cromosoma, signal),
    enabled: cromosoma !== null,
    staleTime: Infinity,
  });

  if (habitual.isError)
    return <EstadoError error={habitual.error} onReintentar={() => void habitual.refetch()} />;
  if (!habitual.data) return <Skeleton className="h-36 w-full" />;

  const base = habitual.data.bt5b.total_mensual_soles;
  const filas = [
    { nombre: 'Horario habitual con BT5B (tarifa plana)', total: base },
    {
      nombre: 'Horario habitual con BT5-I (horaria)',
      total: habitual.data.bt5i.total_mensual_soles,
    },
    ...(optimizado.data
      ? [
          {
            nombre: 'Horario optimizado con BT5-I',
            total: optimizado.data.bt5i.total_mensual_soles,
            destacada: true,
          },
        ]
      : []),
  ];
  const maximo = Math.max(...filas.map((f) => f.total));

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {filas.map((f, i) => {
          const ahorro = ((base - f.total) / base) * 100;
          return (
            <li key={f.nombre} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={'destacada' in f ? 'font-medium text-ink' : 'text-ink-muted'}>
                  {f.nombre}
                </span>
                <span className="num whitespace-nowrap text-ink">
                  {formatSoles(f.total)}
                  {i > 0 ? (
                    <span className="ml-2 text-xs text-success">−{formatPct(ahorro)}</span>
                  ) : null}
                </span>
              </div>
              <Meter
                valor={f.total}
                max={maximo}
                retraso={i * 0.06}
                colorClase={'destacada' in f ? 'bg-accent' : 'bg-border-strong'}
                etiqueta={f.nombre}
              />
            </li>
          );
        })}
      </ul>
      {cromosoma && optimizado.isPending ? <Skeleton className="h-6 w-full" /> : null}
      <p className="text-xs text-ink-faint">
        {habitual.data.nota} Fuente: {habitual.data.fuente}.
      </p>
    </div>
  );
}
