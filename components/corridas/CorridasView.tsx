'use client';

import { useQueries, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { EstadoError } from '@/components/EstadoError';
import { Convergencia } from '@/components/graficos/Convergencia';
import { UnPanel } from '@/components/layout/Paneles';
import { Badge } from '@/components/ui/Badge';
import { clasesBoton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useEscenario } from '@/hooks/useEscenario';
import { obtenerCorridas, obtenerResultadoCorrida } from '@/lib/api';
import { TEXTO_MOTIVO } from '@/lib/constants';
import { formatEntero, formatNumero, formatPct, formatSoles } from '@/lib/format';

const COLORES = [
  'rgb(var(--curva-1))',
  'rgb(var(--curva-2))',
  'rgb(var(--curva-3))',
  'rgb(var(--curva-4))',
];
const VENTANAS = [
  { valor: '50', etiqueta: 'Primeras 50 generaciones' },
  { valor: '100', etiqueta: 'Primeras 100 generaciones' },
  { valor: '200', etiqueta: 'Primeras 200 generaciones' },
  { valor: 'todas', etiqueta: 'Todas las generaciones' },
];

export function CorridasView() {
  const escenario = useEscenario();
  const [ventana, setVentana] = useState('100');
  const corridas = useQuery({
    queryKey: ['corridas'],
    queryFn: ({ signal }) => obtenerCorridas(signal),
    staleTime: Infinity,
  });
  const resultados = useQueries({
    queries: (corridas.data ?? []).map((c) => ({
      queryKey: ['corrida', c.id],
      queryFn: ({ signal }: { signal: AbortSignal }) => obtenerResultadoCorrida(c.id, signal),
      staleTime: Infinity,
    })),
  });

  const listos = resultados.length > 0 && resultados.every((r) => r.data);
  // Une los historiales por generación (4 × 501 filas como máximo: no hace falta memorizar).
  const datos: Record<string, number>[] = [];
  if (listos) {
    const limite = ventana === 'todas' ? Number.POSITIVE_INFINITY : Number(ventana);
    const filas = new Map<number, Record<string, number>>();
    resultados.forEach((r, i) => {
      for (const p of r.data!.historial) {
        if (p.generacion > limite) break;
        const fila = filas.get(p.generacion) ?? { generacion: p.generacion };
        fila[`c${i + 1}`] = p.objetivo;
        filas.set(p.generacion, fila);
      }
    });
    datos.push(...[...filas.values()].sort((a, b) => a.generacion - b.generacion));
  }

  const error = corridas.error ?? resultados.find((r) => r.isError)?.error;

  return (
    <UnPanel ancho="max-w-5xl" className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Corridas del informe</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Las cuatro configuraciones de la sección 8 del informe, cada una ejecutada con la semilla
          2026. Cambian una sola cosa respecto de la base: el cruce, la selección o la población
          inicial. El informe repite cada corrida con 30 semillas; aquí se muestra una ejecución
          para inspeccionarla.
        </p>
      </div>

      {error ? (
        <EstadoError
          error={error}
          titulo="No se pudieron cargar las corridas"
          onReintentar={() => {
            void corridas.refetch();
            resultados.forEach((r) => void r.refetch());
          }}
        />
      ) : null}

      <Card
        titulo="Convergencia del mejor objetivo"
        acciones={
          <Select
            etiqueta="Ventana de generaciones"
            valor={ventana}
            opciones={VENTANAS}
            onChange={setVentana}
            className="w-64"
          />
        }
      >
        {listos && escenario.data ? (
          <Convergencia
            datos={datos}
            series={(corridas.data ?? []).map((c, i) => ({
              clave: `c${i + 1}`,
              nombre: c.nombre.replace(/^Corrida (\d): /, 'C$1 '),
              color: COLORES[i],
            }))}
            objetivoMinimo={escenario.data.objetivo_minimo}
            generacionesMax={ventana === 'todas' ? undefined : Number(ventana)}
            alto={300}
          />
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-72 w-full" />
            <p className="text-xs text-ink-faint" role="status">
              La primera vez el backend ejecuta las cuatro corridas; puede tardar unos segundos.
            </p>
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {(corridas.data ?? []).map((c, i) => {
          const r = resultados[i]?.data;
          return (
            <Card
              key={c.id}
              titulo={
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORES[i] }}
                  />
                  {c.nombre}
                </span>
              }
              aparecer
              retraso={i * 0.05}
            >
              <p className="text-sm text-ink-muted">{c.descripcion}</p>
              <p className="mt-1 text-xs text-ink-faint">Cambio: {c.cambio}</p>
              {r ? (
                <>
                  <dl className="num mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs text-ink-faint">Mejor encontrado en</dt>
                      <dd className="text-ink">generación {formatEntero(r.generacion_mejor)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-faint">Evaluaciones totales</dt>
                      <dd className="text-ink">{formatEntero(r.evaluaciones)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-faint">Costo semanal</dt>
                      <dd className="text-ink">
                        {formatSoles(r.mejor.costo)} ({formatPct(r.ahorro_pct)} de ahorro)
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink-faint">PADR</dt>
                      <dd className="text-ink">{formatNumero(r.mejor.padr, 3)}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    {r.optimo_alcanzado ? (
                      <Badge tono="exito">Óptimo demostrado</Badge>
                    ) : (
                      <Badge tono="aviso">Sin alcanzar el óptimo</Badge>
                    )}
                    <Link href={`/?corrida=${c.id}`} className={clasesBoton('secundario')}>
                      Abrir en el simulador
                    </Link>
                  </div>
                  <p className="mt-2 text-xs text-ink-faint">
                    La ejecución {TEXTO_MOTIVO[r.motivo_parada] ?? 'terminó'} (
                    {formatEntero(r.generaciones_ejecutadas)} generaciones,{' '}
                    {formatNumero(r.tiempo_s, 2)} s en el servidor).
                  </p>
                </>
              ) : (
                <Skeleton className="mt-3 h-24 w-full" />
              )}
            </Card>
          );
        })}
        {corridas.isPending ? (
          <>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        ) : null}
      </div>
    </UnPanel>
  );
}
