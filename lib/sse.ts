import type { ConfigAG, EventoFin, EventoGeneracion, EventoInicio } from '@/types/api';

/** Estado de una ejecución transmitida por SSE. Reductor puro: se prueba sin navegador. */

export type Fase = 'inactivo' | 'conectando' | 'ejecutando' | 'terminado' | 'detenido' | 'error';

export interface PuntoSerie {
  generacion: number;
  objetivo: number;
  objetivo_promedio: number;
  costo: number;
  padr: number;
  factibles: number;
}

export interface MejorHorario {
  generacion: number;
  cromosoma: number[];
  inicios: number[];
  perfil: number[];
}

export interface EstadoEjecucion {
  fase: Fase;
  config: ConfigAG | null;
  inicio: EventoInicio | null;
  ultimo: EventoGeneracion | null;
  mejor: MejorHorario | null;
  serie: PuntoSerie[];
  fin: EventoFin | null;
  error: string | null;
}

export type Accion =
  | { tipo: 'conectar'; config: ConfigAG }
  | { tipo: 'inicio'; datos: EventoInicio }
  | { tipo: 'generaciones'; datos: EventoGeneracion[] }
  | { tipo: 'fin'; datos: EventoFin }
  | { tipo: 'detener' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'reiniciar' };

export const ESTADO_INICIAL: EstadoEjecucion = {
  fase: 'inactivo',
  config: null,
  inicio: null,
  ultimo: null,
  mejor: null,
  serie: [],
  fin: null,
  error: null,
};

export const enCurso = (fase: Fase) => fase === 'conectando' || fase === 'ejecutando';

export function reductor(estado: EstadoEjecucion, accion: Accion): EstadoEjecucion {
  switch (accion.tipo) {
    case 'conectar':
      return { ...ESTADO_INICIAL, fase: 'conectando', config: accion.config };
    case 'inicio':
      if (!enCurso(estado.fase)) return estado;
      return { ...estado, fase: 'ejecutando', inicio: accion.datos, config: accion.datos.config };
    case 'generaciones': {
      if (!enCurso(estado.fase) || accion.datos.length === 0) return estado;
      let mejor = estado.mejor;
      const nuevos: PuntoSerie[] = [];
      for (const g of accion.datos) {
        nuevos.push({
          generacion: g.generacion,
          objetivo: g.objetivo,
          objetivo_promedio: g.objetivo_promedio,
          costo: g.costo,
          padr: g.padr,
          factibles: g.factibles,
        });
        if (g.mejor_cromosoma && g.mejor_inicios && g.perfil) {
          mejor = {
            generacion: g.mejoro || !mejor ? g.generacion : mejor.generacion,
            cromosoma: g.mejor_cromosoma,
            inicios: g.mejor_inicios,
            perfil: g.perfil,
          };
        }
      }
      return {
        ...estado,
        fase: 'ejecutando',
        ultimo: accion.datos[accion.datos.length - 1],
        mejor,
        serie: estado.serie.concat(nuevos),
      };
    }
    case 'fin':
      if (!enCurso(estado.fase)) return estado;
      return {
        ...estado,
        fase: 'terminado',
        fin: accion.datos,
        mejor: {
          generacion: accion.datos.generacion_mejor,
          cromosoma: accion.datos.mejor_cromosoma,
          inicios: accion.datos.mejor_inicios,
          perfil: accion.datos.perfil,
        },
      };
    case 'detener':
      return enCurso(estado.fase) ? { ...estado, fase: 'detenido' } : estado;
    case 'error':
      return enCurso(estado.fase) ? { ...estado, fase: 'error', error: accion.mensaje } : estado;
    case 'reiniciar':
      return ESTADO_INICIAL;
    default:
      return estado;
  }
}

/**
 * Reduce la serie para graficar: con miles de generaciones se conserva un punto de cada `paso`
 * y siempre el último, de modo que el gráfico no supere `maximo` puntos.
 */
export function submuestrear<T>(serie: T[], maximo = 600): T[] {
  if (serie.length <= maximo) return serie;
  const paso = Math.ceil(serie.length / maximo);
  const salida = serie.filter((_, i) => i % paso === 0);
  if ((serie.length - 1) % paso !== 0) salida.push(serie[serie.length - 1]);
  return salida;
}
