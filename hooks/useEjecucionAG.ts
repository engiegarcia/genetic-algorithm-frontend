'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { healthCheck, urlStream } from '@/lib/api';
import { ESTADO_INICIAL, reductor } from '@/lib/sse';
import type { ConfigAG, EventoFin, EventoGeneracion, EventoInicio } from '@/types/api';

const leer = <T>(e: Event) => JSON.parse((e as MessageEvent<string>).data) as T;

/**
 * Ejecuta el AG con streaming (EventSource). Los eventos `generacion` se acumulan y se aplican
 * una vez por frame, así una corrida sin pausa (cientos de eventos por segundo) no bloquea la UI.
 * El EventSource se cierra en `fin`, en `onerror` (si no, reconectaría y relanzaría la corrida)
 * y al desmontar.
 */
export function useEjecucionAG() {
  const [estado, despachar] = useReducer(reductor, ESTADO_INICIAL);
  const fuente = useRef<EventSource | null>(null);
  const pendientes = useRef<EventoGeneracion[]>([]);
  const frame = useRef<number | null>(null);
  const recibioInicio = useRef(false);

  const vaciar = useCallback(() => {
    frame.current = null;
    if (pendientes.current.length === 0) return;
    const lote = pendientes.current;
    pendientes.current = [];
    despachar({ tipo: 'generaciones', datos: lote });
  }, []);

  const cerrar = useCallback(() => {
    fuente.current?.close();
    fuente.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  const ejecutar = useCallback(
    (config: ConfigAG, retardoMs: number) => {
      cerrar();
      pendientes.current = [];
      recibioInicio.current = false;
      despachar({ tipo: 'conectar', config });

      const es = new EventSource(urlStream(config, retardoMs));
      fuente.current = es;

      es.addEventListener('inicio', (e) => {
        recibioInicio.current = true;
        despachar({ tipo: 'inicio', datos: leer<EventoInicio>(e) });
      });
      es.addEventListener('generacion', (e) => {
        pendientes.current.push(leer<EventoGeneracion>(e));
        if (frame.current === null) frame.current = requestAnimationFrame(vaciar);
      });
      es.addEventListener('fin', (e) => {
        const datos = leer<EventoFin>(e);
        cerrar();
        vaciar();
        despachar({ tipo: 'fin', datos });
      });
      es.onerror = () => {
        if (fuente.current !== es) return;
        cerrar();
        vaciar();
        if (recibioInicio.current) {
          despachar({
            tipo: 'error',
            mensaje: 'Se perdió la conexión con el backend durante la ejecución.',
          });
          return;
        }
        // EventSource no expone el estado HTTP: se consulta /health para distinguir un 422 de una caída.
        healthCheck()
          .then(() =>
            despachar({
              tipo: 'error',
              mensaje: 'El backend rechazó la configuración. Revisa los límites de los parámetros.',
            }),
          )
          .catch(() =>
            despachar({
              tipo: 'error',
              mensaje:
                'No se pudo conectar con el backend. Revisa que esté en marcha y que el origen esté permitido (CORS).',
            }),
          );
      };
    },
    [cerrar, vaciar],
  );

  const detener = useCallback(() => {
    cerrar();
    vaciar();
    despachar({ tipo: 'detener' });
  }, [cerrar, vaciar]);

  useEffect(() => cerrar, [cerrar]);

  return { estado, ejecutar, detener };
}
