'use client';

import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { EstadoError } from '@/components/EstadoError';
import { DosPaneles } from '@/components/layout/Paneles';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { Slider } from '@/components/ui/Slider';
import { useEscenario } from '@/hooks/useEscenario';
import { demoOperador, evaluarHorario } from '@/lib/api';
import { cn } from '@/lib/cn';
import { NOMBRE_CORTO, OPCIONES_OPERADOR } from '@/lib/constants';
import { formatNumero, formatSoles, horaSemana } from '@/lib/format';
import { origenGenes, posicionesCorte, type DetalleOperador, type Origen } from '@/lib/operadores';
import type { DemoOperadorRequest, Evaluacion, Operador, Tarea } from '@/types/api';

const SEMILLA_INICIAL = 2028;

const FONDO_ORIGEN: Record<Origen, string> = {
  p1: 'bg-curva-1/15 border-curva-1/40',
  p2: 'bg-curva-2/15 border-curva-2/40',
  mutado: 'bg-warning/20 border-warning',
};

function ResumenEvaluacion({ e }: { e: Evaluacion | undefined }) {
  if (!e) return <Skeleton className="h-5 w-48" />;
  return (
    <span className="num flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
      <span>Costo {formatSoles(e.costo)}</span>
      <span>PADR {formatNumero(e.padr, 3)}</span>
      <span>f {formatNumero(e.objetivo, 4)}</span>
      {e.factible ? (
        <Badge tono="exito">Factible</Badge>
      ) : (
        <Badge tono="peligro">Viola {formatNumero(e.violacion_kwh, 1)} kWh</Badge>
      )}
    </span>
  );
}

function FilaCromosoma({
  nombre,
  cromosoma,
  tareas,
  origen,
  cortes,
  evaluacion,
  mascara,
  onAlternarMascara,
}: {
  nombre: string;
  cromosoma: number[];
  tareas: Tarea[];
  origen: Origen[];
  cortes: number[];
  evaluacion: Evaluacion | undefined;
  mascara?: boolean[];
  onAlternarMascara?: (j: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">{nombre}</h3>
        <ResumenEvaluacion e={evaluacion} />
      </div>
      <ol
        className="grid grid-cols-[repeat(13,minmax(3.25rem,1fr))] gap-1"
        aria-label={`Genes de ${nombre}`}
      >
        {cromosoma.map((g, j) => {
          const t = tareas[j];
          const inicio = t.inicios[g];
          const contenido = (
            <>
              <span className="num block text-sm font-semibold text-ink">{g}</span>
              <span className="num block text-[11px] leading-tight text-ink-muted">
                {horaSemana(inicio)}
              </span>
            </>
          );
          return (
            <li
              key={j}
              className={cn(
                'relative rounded-md border px-1 py-1.5 text-center',
                FONDO_ORIGEN[origen[j]],
                mascara?.[j] && 'ring-2 ring-accent',
                cortes.includes(j) &&
                  'ml-1.5 before:absolute before:-left-[5px] before:inset-y-[-6px] before:w-0.5 before:rounded-full before:bg-ink',
              )}
              title={`${t.artefacto} · sesión ${t.sesion}: índice ${g} → ${horaSemana(inicio, true)}`}
            >
              {onAlternarMascara && mascara ? (
                <button
                  type="button"
                  onClick={() => onAlternarMascara(j)}
                  aria-pressed={mascara[j]}
                  aria-label={`Gen ${j + 1} (${NOMBRE_CORTO[t.artefacto] ?? t.artefacto} ${t.sesion}): ${mascara[j] ? 'se intercambia' : 'se conserva'}`}
                  className="block w-full rounded-md"
                >
                  {contenido}
                </button>
              ) : (
                contenido
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function OperadoresView() {
  const escenario = useEscenario();
  const [operador, setOperador] = useState<Operador>('uniforme');
  const [semilla, setSemilla] = useState(SEMILLA_INICIAL);
  const [ajustes, setAjustes] = useState<Omit<DemoOperadorRequest, 'operador' | 'semilla'>>({});

  const peticion: DemoOperadorRequest = { operador, semilla, ...ajustes };
  const demo = useQuery({
    queryKey: ['demo', peticion],
    queryFn: ({ signal }) => demoOperador(peticion, signal),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
  });
  const padres = demo.data
    ? [demo.data.padre1, ...(demo.data.padre2 ? [demo.data.padre2] : [])]
    : [];
  const evalPadres = useQueries({
    queries: padres.map((p) => ({
      queryKey: ['evaluar', p],
      queryFn: ({ signal }: { signal: AbortSignal }) => evaluarHorario(p, undefined, signal),
      staleTime: Infinity,
    })),
  });

  const cambiarOperador = (v: string) => {
    setOperador(v as Operador);
    setAjustes({});
  };
  const otrosPadres = () => {
    setSemilla((s) => s + 1);
    setAjustes({});
  };

  const tareas = escenario.data?.tareas;
  const n = tareas?.length ?? 13;
  const detalle = (demo.data?.detalle ?? {}) as DetalleOperador;
  const coincide = demo.data?.operador === operador;

  const controles = (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Operadores genéticos</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Aplica un cruce o la mutación a dos horarios y observa cómo se combinan los genes. Cada
          gen es el índice de la hora de inicio dentro de la franja permitida de su sesión, así que
          los hijos siempre respetan las franjas; lo que puede romperse es el límite de 5000 W o la
          no superposición.
        </p>
      </div>
      <div className="space-y-1.5">
        <span className="etiqueta block" aria-hidden="true">
          Operador
        </span>
        <Select
          etiqueta="Operador"
          valor={operador}
          opciones={OPCIONES_OPERADOR}
          onChange={cambiarOperador}
        />
      </div>

      {coincide && operador === 'un_punto' && detalle.corte !== undefined ? (
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <label htmlFor="corte" className="etiqueta">
              Corte
            </label>
            <span className="num text-sm text-ink">después del gen {detalle.corte}</span>
          </div>
          <Slider
            id="corte"
            value={detalle.corte}
            min={1}
            max={n - 1}
            step={1}
            onChange={(v) => setAjustes({ corte1: v })}
            valueText={`Corte después del gen ${detalle.corte}`}
          />
        </div>
      ) : null}

      {coincide &&
      operador === 'dos_puntos' &&
      detalle.corte1 !== undefined &&
      detalle.corte2 !== undefined ? (
        <div className="space-y-3">
          {(['corte1', 'corte2'] as const).map((clave, k) => (
            <div key={clave} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <label htmlFor={clave} className="etiqueta">
                  Corte {k + 1}
                </label>
                <span className="num text-sm text-ink">después del gen {detalle[clave]}</span>
              </div>
              <Slider
                id={clave}
                value={detalle[clave]!}
                min={k === 0 ? 1 : 2}
                max={k === 0 ? n - 2 : n - 1}
                step={1}
                onChange={(v) => {
                  let a = k === 0 ? v : detalle.corte1!;
                  let b = k === 1 ? v : detalle.corte2!;
                  if (a >= b) {
                    if (k === 0) b = a + 1;
                    else a = b - 1;
                  }
                  setAjustes({ corte1: a, corte2: b });
                }}
                valueText={`Corte ${k + 1} después del gen ${detalle[clave]}`}
              />
            </div>
          ))}
        </div>
      ) : null}

      {coincide && operador === 'uniforme' ? (
        <p className="text-sm text-ink-muted">
          Pulsa un gen del padre 1 para cambiar su valor en la máscara: los genes marcados se
          intercambian entre los padres.
        </p>
      ) : null}

      {coincide && operador === 'mutacion' && tareas ? (
        <div className="space-y-1.5">
          <span className="etiqueta block" aria-hidden="true">
            Gen que muta
          </span>
          <Select
            etiqueta="Gen que muta"
            valor={String(detalle.gen ?? 0)}
            opciones={tareas.map((t, j) => ({
              valor: String(j),
              etiqueta: `Gen ${j + 1}: ${NOMBRE_CORTO[t.artefacto] ?? t.artefacto} ${t.sesion} (${t.inicios.length} valores)`,
            }))}
            onChange={(v) => setAjustes({ gen: Number(v) })}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={otrosPadres}>Otros padres</Button>
        {Object.keys(ajustes).length > 0 ? (
          <Button variante="fantasma" onClick={() => setAjustes({})}>
            Parámetros aleatorios
          </Button>
        ) : null}
      </div>
      <p className="num text-xs text-ink-faint">
        Semilla {semilla}. Los padres se generan al azar con esta semilla; con la misma semilla se
        repiten.
      </p>
    </div>
  );

  let resultado;
  if (escenario.isError || demo.isError) {
    const error = escenario.error ?? demo.error;
    resultado = (
      <EstadoError
        error={error}
        onReintentar={() => {
          void escenario.refetch();
          void demo.refetch();
        }}
      />
    );
  } else if (!tareas || !demo.data) {
    resultado = <Skeleton className="h-96 w-full" />;
  } else {
    const d = demo.data;
    const origenes = origenGenes(d.operador, detalle, n);
    const cortes = posicionesCorte(d.operador, detalle);
    const mascara = d.operador === 'uniforme' ? detalle.mascara : undefined;
    resultado = (
      <div className="relative space-y-4">
        <LinearProgress visible={demo.isFetching} />
        <Card titulo="Padres" aparecer>
          <div className="scroll-panel space-y-4 overflow-x-auto pb-1">
            <FilaCromosoma
              nombre="Padre 1"
              cromosoma={d.padre1}
              tareas={tareas}
              origen={d.padre1.map(() => 'p1')}
              cortes={cortes}
              evaluacion={evalPadres[0]?.data?.evaluacion}
              mascara={mascara}
              onAlternarMascara={
                mascara
                  ? (j) => setAjustes({ mascara: mascara.map((m, i) => (i === j ? !m : m)) })
                  : undefined
              }
            />
            {d.padre2 ? (
              <FilaCromosoma
                nombre="Padre 2"
                cromosoma={d.padre2}
                tareas={tareas}
                origen={d.padre2.map(() => 'p2')}
                cortes={cortes}
                evaluacion={evalPadres[1]?.data?.evaluacion}
              />
            ) : null}
          </div>
        </Card>
        <Card titulo={d.hijos.length > 1 ? 'Hijos' : 'Hijo'} aparecer retraso={0.05}>
          <div className="scroll-panel space-y-4 overflow-x-auto pb-1">
            {d.hijos.map((h, k) => (
              <FilaCromosoma
                key={k}
                nombre={d.hijos.length > 1 ? `Hijo ${k + 1}` : 'Hijo (mutado)'}
                cromosoma={h.cromosoma}
                tareas={tareas}
                origen={origenes[k]}
                cortes={cortes}
                evaluacion={h.evaluacion}
              />
            ))}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted">
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className={cn('h-3 w-4 rounded border', FONDO_ORIGEN.p1)} />{' '}
              Gen del padre 1
            </li>
            {d.padre2 ? (
              <li className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn('h-3 w-4 rounded border', FONDO_ORIGEN.p2)}
                />{' '}
                Gen del padre 2
              </li>
            ) : (
              <li className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn('h-3 w-4 rounded border', FONDO_ORIGEN.mutado)}
                />{' '}
                Gen mutado ({detalle.valor_anterior} → {detalle.valor_nuevo})
              </li>
            )}
            {mascara ? (
              <li className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-3 w-4 rounded ring-2 ring-accent" /> Gen
                marcado en la máscara
              </li>
            ) : null}
            {cortes.length > 0 ? (
              <li className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="h-3 w-0.5 rounded-full bg-ink" /> Punto de corte
              </li>
            ) : null}
          </ul>
          <p className="mt-3 text-sm text-ink-muted">
            {d.explicacion} Fuente: {d.fuente}.
          </p>
        </Card>
        <Card titulo="Cómo leer los genes" aparecer retraso={0.1}>
          <p className="text-sm text-ink-muted">
            Cada casilla muestra el índice del gen y la hora de inicio que representa. Los genes 1 a
            7 son la terma (uno por día), el 8 la lavadora, del 9 al 11 la plancha, el 12 la
            aspiradora y el 13 la lustradora. Un hijo puede ser infactible si dos sesiones del mismo
            artefacto se superponen o si la demanda supera 5000 W; en el algoritmo, las reglas de
            Deb lo ubican detrás de cualquier solución factible.
          </p>
        </Card>
      </div>
    );
  }

  return <DosPaneles izquierda={controles} derecha={resultado} />;
}
