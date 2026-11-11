'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { Convergencia } from '@/components/graficos/Convergencia';
import { PerfilDemanda } from '@/components/graficos/PerfilDemanda';
import { HorarioSemanal, TablaSesiones } from '@/components/horario/HorarioSemanal';
import { DosPaneles } from '@/components/layout/Paneles';
import { Card } from '@/components/ui/Card';
import { Casilla } from '@/components/ui/Campo';
import { Colapsable } from '@/components/ui/Colapsable';
import { LinearProgress } from '@/components/ui/LinearProgress';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tile } from '@/components/ui/Tile';
import { useEjecucionAG } from '@/hooks/useEjecucionAG';
import { useEscenario } from '@/hooks/useEscenario';
import { useServidorDespertando } from '@/hooks/useServidorDespertando';
import { evaluarHorario, obtenerCorridas } from '@/lib/api';
import { CONFIG_BASE, TEXTO_MOTIVO, VELOCIDADES, VELOCIDAD_POR_DEFECTO } from '@/lib/constants';
import { formatEntero, formatNumero, formatPct } from '@/lib/format';
import { configAFormulario, validarConfig, type FormConfig } from '@/lib/schemas';
import { enCurso } from '@/lib/sse';
import { ComparacionTarifas } from './ComparacionTarifas';
import { FormularioConfig } from './FormularioConfig';
import { Indicadores } from './Indicadores';

export function SimuladorView() {
  const escenario = useEscenario();
  const { estado, ejecutar, detener } = useEjecucionAG();
  const [formulario, setFormulario] = useState<FormConfig>(() => configAFormulario(CONFIG_BASE));
  const [velocidad, setVelocidad] = useState<string>(VELOCIDAD_POR_DEFECTO);
  const [mostrarHabitual, setMostrarHabitual] = useState(true);
  const [corridaActiva, setCorridaActiva] = useState<number | null>(null);

  const corridas = useQuery({
    queryKey: ['corridas'],
    queryFn: ({ signal }) => obtenerCorridas(signal),
    staleTime: Infinity,
  });
  const perfilHabitual = useQuery({
    queryKey: ['evaluar', escenario.data?.habitual_cromosoma],
    queryFn: ({ signal }) => evaluarHorario(escenario.data!.habitual_cromosoma, undefined, signal),
    enabled: Boolean(escenario.data),
    staleTime: Infinity,
  });

  // /?corrida=N carga la configuración de una corrida del informe (enlace desde /corridas).
  const parametros = useSearchParams();
  const corridaUrl = Number(parametros.get('corrida'));
  useEffect(() => {
    const c = corridas.data?.find((x) => x.id === corridaUrl);
    if (c) {
      setFormulario(configAFormulario(c.config));
      setCorridaActiva(c.id);
    }
  }, [corridaUrl, corridas.data]);

  const validacion = useMemo(() => validarConfig(formulario), [formulario]);
  const errores = validacion.ok ? {} : validacion.errores;
  const ejecutando = enCurso(estado.fase);
  const despertando = useServidorDespertando(estado.fase === 'conectando' || escenario.isPending);

  const cambiar = useCallback(<K extends keyof FormConfig>(campo: K, valor: FormConfig[K]) => {
    setFormulario((f) => ({ ...f, [campo]: valor }));
    setCorridaActiva(null);
  }, []);

  const lanzar = useCallback(() => {
    if (!validacion.ok) return;
    const ms = VELOCIDADES.find((v) => v.valor === velocidad)?.ms ?? 20;
    ejecutar(validacion.config, ms);
  }, [ejecutar, validacion, velocidad]);

  const izquierda = (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Simulador</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Configura el algoritmo genético y observa, generación a generación, cómo reprograma la
          terma, la lavadora, la plancha, la aspiradora y la lustradora para bajar el costo con la
          tarifa BT5-I.
        </p>
      </div>
      <section aria-labelledby="titulo-corridas" className="space-y-2">
        <h2 id="titulo-corridas" className="etiqueta">
          Corridas del informe
        </h2>
        {corridas.data ? (
          <div className="grid gap-2">
            {corridas.data.map((c) => (
              <Tile
                key={c.id}
                titulo={c.nombre}
                descripcion={c.cambio}
                activo={corridaActiva === c.id}
                onClick={() => {
                  setFormulario(configAFormulario(c.config));
                  setCorridaActiva(c.id);
                }}
              />
            ))}
          </div>
        ) : corridas.isError ? (
          <p className="text-xs text-ink-faint">No se pudieron cargar las corridas.</p>
        ) : (
          <Skeleton className="h-40 w-full" />
        )}
      </section>
      <FormularioConfig
        formulario={formulario}
        errores={errores}
        onCambio={cambiar}
        velocidad={velocidad}
        onVelocidad={setVelocidad}
        ejecutando={ejecutando}
        onEjecutar={lanzar}
        onDetener={detener}
        onRestablecer={() => {
          setFormulario(configAFormulario(CONFIG_BASE));
          setCorridaActiva(null);
        }}
      />
    </div>
  );

  let derecha;
  if (escenario.isError) {
    derecha = (
      <EstadoError
        titulo="No se pudo cargar el caso de estudio"
        error={escenario.error}
        onReintentar={() => void escenario.refetch()}
      />
    );
  } else if (!escenario.data) {
    derecha = (
      <div className="space-y-4">
        {despertando ? (
          <p role="status" className="text-sm text-ink-muted">
            Conectando con el backend. Si está alojado en un plan gratuito, puede tardar hasta un
            minuto en despertar.
          </p>
        ) : null}
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  } else {
    const esc = escenario.data;
    const actual = estado.ultimo;
    const inicio = estado.inicio;
    const serie = estado.serie as unknown as Record<string, number>[];
    derecha = (
      <div className="space-y-4">
        <LinearProgress visible={estado.fase === 'conectando'} />
        {estado.fase === 'conectando' && despertando ? (
          <p role="status" className="text-sm text-ink-muted">
            Esperando al backend. Si está alojado en un plan gratuito, puede tardar hasta un minuto
            en despertar.
          </p>
        ) : null}
        {estado.fase === 'error' && estado.error ? (
          <div
            role="alert"
            className="rounded-lg border border-danger/50 bg-surface/80 p-4 text-sm text-danger"
          >
            {estado.error}
          </div>
        ) : null}
        <Card titulo="Mejor solución" aparecer>
          <Indicadores
            actual={actual}
            habitual={esc.habitual}
            cotaCosto={esc.cota_costo}
            padrMinimo={esc.padr_minimo}
            objetivoMinimo={esc.objetivo_minimo}
            generacion={actual?.generacion ?? null}
            generacionesMax={inicio?.generaciones_maximas ?? null}
            factibles={actual?.factibles ?? null}
            poblacion={estado.config?.poblacion ?? null}
          />
          {estado.fin ? (
            <p role="status" className="mt-3 text-sm text-ink-muted">
              La ejecución {TEXTO_MOTIVO[estado.fin.motivo_parada] ?? 'terminó'} tras{' '}
              {formatEntero(estado.fin.generaciones_ejecutadas)} generaciones y{' '}
              {formatEntero(estado.fin.evaluaciones)} evaluaciones. La mejor solución apareció en la
              generación {formatEntero(estado.fin.generacion_mejor)}
              {estado.fin.sembrados > 0
                ? ` (${formatEntero(estado.fin.sembrados)} individuos sembrados)`
                : ''}
              ; ahorro de {formatPct(estado.fin.ahorro_pct)} frente al horario habitual.
            </p>
          ) : estado.fase === 'detenido' ? (
            <p role="status" className="mt-3 text-sm text-ink-muted">
              Ejecución detenida en la generación {formatEntero(actual?.generacion ?? 0)}.
            </p>
          ) : null}
        </Card>

        <Card
          titulo="Horario semanal"
          aparecer
          retraso={0.05}
          acciones={
            estado.mejor ? (
              <Casilla
                etiqueta="Mostrar habitual"
                marcada={mostrarHabitual}
                onChange={setMostrarHabitual}
              />
            ) : null
          }
        >
          <HorarioSemanal
            tareas={esc.tareas}
            inicios={estado.mejor?.inicios ?? null}
            mostrarHabitual={mostrarHabitual}
          />
          <div className="mt-4 border-t border-border pt-3">
            <h3 className="etiqueta mb-2">Tabla de sesiones</h3>
            <Colapsable
              claveDatos={(estado.mejor?.inicios ?? []).join(',')}
              pendiente={ejecutando}
              alturaMax={180}
            >
              <TablaSesiones tareas={esc.tareas} inicios={estado.mejor?.inicios ?? null} />
            </Colapsable>
          </div>
        </Card>

        <Card titulo="Demanda horaria de la semana" aparecer retraso={0.1}>
          <PerfilDemanda
            perfil={estado.mejor?.perfil ?? null}
            habitual={perfilHabitual.data?.perfil ?? null}
            fijo={esc.perfil_fijo}
            limite={esc.limite_w}
          />
          <p className="mt-2 text-xs text-ink-faint">
            Carga fija (sombreada), horario habitual (discontinua) y mejor horario encontrado (línea
            continua). La franja punta de cada día está sombreada.
          </p>
        </Card>

        <Card titulo="Convergencia del objetivo" aparecer retraso={0.15}>
          {serie.length > 0 ? (
            <Convergencia
              datos={serie}
              series={[
                { clave: 'objetivo', nombre: 'Mejor f', color: 'rgb(var(--accent))' },
                {
                  clave: 'objetivo_promedio',
                  nombre: 'f promedio de la población',
                  color: 'rgb(var(--ink-faint))',
                  discontinua: true,
                },
              ]}
              objetivoMinimo={esc.objetivo_minimo}
              generacionesMax={inicio?.generaciones_maximas}
              techo={1.25}
            />
          ) : (
            <EstadoVacio titulo="Aún no hay generaciones">
              Pulsa «Ejecutar» para ver cómo baja el objetivo hasta el óptimo demostrado (
              {formatNumero(esc.objetivo_minimo, 4)}).
            </EstadoVacio>
          )}
        </Card>

        <Card titulo="Costo mensual: BT5-I frente a BT5B" aparecer retraso={0.2}>
          <ComparacionTarifas
            cromosoma={estado.fase === 'terminado' ? (estado.mejor?.cromosoma ?? null) : null}
          />
        </Card>
      </div>
    );
  }

  return <DosPaneles izquierda={izquierda} derecha={derecha} />;
}
