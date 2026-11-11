'use client';

import { EstadoError } from '@/components/EstadoError';
import { PerfilDemanda } from '@/components/graficos/PerfilDemanda';
import { UnPanel } from '@/components/layout/Paneles';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useEscenario } from '@/hooks/useEscenario';
import { COLOR_ARTEFACTO, DIAS_CORTOS, NOMBRE_CORTO } from '@/lib/constants';
import { formatEntero, formatNumero, horaSemana } from '@/lib/format';
import { describirInicios } from '@/lib/horario';

const NOMBRE_BLOQUE = { base: 'Base', media: 'Media', punta: 'Punta' } as const;
const HORARIO_BLOQUE = { base: '23:00–08:00', media: '08:00–18:00', punta: '18:00–23:00' } as const;

const th = 'py-2 pr-3 text-left text-xs font-medium text-ink-muted';
const td = 'py-1.5 pr-3';

export function CasoView() {
  const escenario = useEscenario();

  if (escenario.isError) {
    return (
      <UnPanel>
        <EstadoError
          titulo="No se pudo cargar el caso de estudio"
          error={escenario.error}
          onReintentar={() => void escenario.refetch()}
        />
      </UnPanel>
    );
  }
  if (!escenario.data) {
    return (
      <UnPanel className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </UnPanel>
    );
  }

  const e = escenario.data;
  const [mantisa, exponente] = e.espacio_busqueda.split('e+');
  const energiaTotal = e.artefactos.reduce((s, a) => s + (a.potencia_w * a.horas_semana) / 1000, 0);
  const energiaDesplazable = e.artefactos
    .filter((a) => a.desplazable)
    .reduce((s, a) => s + (a.potencia_w * a.horas_semana) / 1000, 0);

  return (
    <UnPanel ancho="max-w-5xl" className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Caso de estudio</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Vivienda de ejemplo de la guía del MINEM con 24 artefactos y{' '}
          {formatNumero(energiaTotal, 2)} kWh por semana, de los cuales{' '}
          {formatNumero(energiaDesplazable, 2)} kWh corresponden a los cinco artefactos que el
          algoritmo puede reprogramar. El espacio de búsqueda tiene {mantisa.replace('.', ',')} × 10
          <sup>{exponente}</sup> horarios posibles.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card titulo="Tarifa BT5-I y bloques horarios" aparecer>
          <table className="w-full text-sm">
            <caption className="sr-only">Cargos por energía por bloque horario</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className={th}>
                  Bloque
                </th>
                <th scope="col" className={th}>
                  Horario
                </th>
                <th scope="col" className={`${th} text-right`}>
                  ctm S/ por kWh
                </th>
              </tr>
            </thead>
            <tbody>
              {(['punta', 'media', 'base'] as const).map((b) => (
                <tr key={b} className="border-b border-border last:border-b-0">
                  <td className={`${td} text-ink`}>{NOMBRE_BLOQUE[b]}</td>
                  <td className={`${td} num text-ink-muted`}>{HORARIO_BLOQUE[b]}</td>
                  <td className={`${td} num pr-0 text-right text-ink`}>
                    {formatNumero(e.cargos_ctm_kwh[b], 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-ink-faint">
            Cargo fijo: S/ {formatNumero(e.cargo_fijo_soles_mes, 2)} al mes. Tarifa:{' '}
            {e.fuentes.tarifa}. Bloques: {e.fuentes.bloques}.
          </p>
        </Card>
        <Card titulo="Horario habitual" aparecer retraso={0.05}>
          <dl className="num grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-ink-faint">Costo semanal</dt>
              <dd className="text-ink">S/ {formatNumero(e.habitual.costo, 2)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Cota inferior del costo</dt>
              <dd className="text-ink">S/ {formatNumero(e.cota_costo, 2)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Pico de demanda</dt>
              <dd className="text-ink">{formatEntero(e.habitual.pico_w)} W</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">PADR (pico/promedio)</dt>
              <dd className="text-ink">{formatNumero(e.habitual.padr, 3)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Energía en punta</dt>
              <dd className="text-ink">{formatNumero(e.habitual.energia_punta_kwh, 1)} kWh</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Límite de demanda</dt>
              <dd className="text-ink">{formatEntero(e.limite_w)} W</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-ink-faint">
            La cota del costo ubica cada sesión en su hora más barata; la del PADR es el pico de la
            carga fija. Un horario factible que alcanza ambas es óptimo. Límite: {e.fuentes.limite}.
          </p>
        </Card>
      </div>

      <Card titulo="Sesiones desplazables (genes del cromosoma)" aparecer retraso={0.1}>
        <div className="scroll-panel overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Las 13 sesiones desplazables, sus horas de inicio permitidas y su horario habitual
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className={th}>
                  Gen
                </th>
                <th scope="col" className={th}>
                  Artefacto
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Potencia
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Duración
                </th>
                <th scope="col" className={th}>
                  Inicios permitidos
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Opciones
                </th>
                <th scope="col" className={th}>
                  Habitual
                </th>
              </tr>
            </thead>
            <tbody>
              {e.tareas.map((t) => (
                <tr key={t.indice} className="border-b border-border align-top last:border-b-0">
                  <td className={`${td} num text-ink-muted`}>{t.indice + 1}</td>
                  <td className={`${td} whitespace-nowrap text-ink`}>
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COLOR_ARTEFACTO[t.artefacto] }}
                      />
                      {NOMBRE_CORTO[t.artefacto] ?? t.artefacto} {t.sesion}
                    </span>
                  </td>
                  <td className={`${td} num text-right text-ink-muted`}>
                    {formatEntero(t.potencia_w)} W
                  </td>
                  <td className={`${td} num text-right text-ink-muted`}>{t.duracion} h</td>
                  <td className={`${td} num text-ink-muted`}>
                    {describirInicios(t.inicios, DIAS_CORTOS)}
                  </td>
                  <td className={`${td} num text-right text-ink-muted`}>{t.inicios.length}</td>
                  <td className={`${td} num whitespace-nowrap pr-0 text-ink-muted`}>
                    {horaSemana(t.habitual)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Las franjas permitidas y los horarios habituales son un supuesto declarado del caso de
          estudio (no existe una fuente oficial peruana para ellos): un hogar cuyos ocupantes están
          fuera de casa de lunes a viernes entre las 08:00 y las 18:00. Las horas indicadas son de
          inicio; cada sesión termina dentro de su franja.
        </p>
      </Card>

      <Card titulo="Carga no desplazable de la semana" aparecer retraso={0.15}>
        <PerfilDemanda
          perfil={null}
          habitual={null}
          fijo={e.perfil_fijo}
          limite={e.limite_w}
          alto={220}
        />
        <p className="mt-2 text-xs text-ink-faint">
          Refrigeradora, cocina, artefactos de cocina, televisores, computadora y demás equipos que
          se usan en horas fijas (supuesto del caso). Su pico de{' '}
          {formatEntero(Math.max(...e.perfil_fijo))} W fija la cota inferior del PADR.
        </p>
      </Card>

      <Card titulo="Artefactos de la vivienda" aparecer retraso={0.2}>
        <div className="scroll-panel overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Artefactos de la vivienda de ejemplo del MINEM</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className={th}>
                  Artefacto
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Potencia
                </th>
                <th scope="col" className={`${th} text-right`}>
                  Uso
                </th>
                <th scope="col" className={`${th} text-right`}>
                  h/semana
                </th>
                <th scope="col" className={`${th} text-right`}>
                  kWh/semana
                </th>
                <th scope="col" className={th}>
                  Tipo
                </th>
              </tr>
            </thead>
            <tbody>
              {e.artefactos.map((a) => (
                <tr key={a.nombre} className="border-b border-border last:border-b-0">
                  <td className={`${td} text-ink`}>{a.nombre}</td>
                  <td className={`${td} num text-right text-ink-muted`}>
                    {formatEntero(a.potencia_w)} W
                  </td>
                  <td className={`${td} num whitespace-nowrap text-right text-ink-muted`}>
                    {a.horas} h/{a.frecuencia === 'dia' ? 'día' : 'semana'}
                  </td>
                  <td className={`${td} num text-right text-ink-muted`}>{a.horas_semana}</td>
                  <td className={`${td} num text-right text-ink-muted`}>
                    {formatNumero((a.potencia_w * a.horas_semana) / 1000, 2)}
                  </td>
                  <td className={`${td} pr-0`}>
                    {a.desplazable ? <Badge tono="acento">Desplazable</Badge> : <Badge>Fijo</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-faint">Fuente: {e.fuentes.artefactos}.</p>
      </Card>
    </UnPanel>
  );
}
