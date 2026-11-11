import { TIMEOUT_API_MS } from '@/lib/constants';
import type {
  CompararTarifasResponse,
  ConfigAG,
  Corrida,
  DemoOperadorRequest,
  DemoOperadorResponse,
  ErrorResponse,
  Escenario,
  EvaluarResponse,
  HealthResponse,
  Resultado,
  ValidationErrorItem,
  ValidationErrorResponse,
} from '@/types/api';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(
  /\/+$/,
  '',
);

/* ------------------------------ Errores tipados ------------------------------ */

/** Backend caído, sin red o bloqueado por CORS. */
export class ApiNetworkError extends Error {
  constructor(message = 'No se pudo conectar con el backend') {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

export class ApiTimeoutError extends Error {
  constructor(message = 'El backend no respondió a tiempo') {
    super(message);
    this.name = 'ApiTimeoutError';
  }
}

/** 422. `fieldErrors` mapea el nombre del campo del backend a su mensaje. */
export class ApiValidationError extends Error {
  readonly fieldErrors: Record<string, string>;
  readonly items: ValidationErrorItem[];

  constructor(items: ValidationErrorItem[]) {
    super('Entradas inválidas según el backend');
    this.name = 'ApiValidationError';
    this.items = items;
    this.fieldErrors = {};
    for (const item of items) {
      const campo = [...item.loc]
        .reverse()
        .find((parte): parte is string => typeof parte === 'string');
      if (campo && campo !== 'body' && !(campo in this.fieldErrors)) {
        this.fieldErrors[campo] = item.msg;
      }
    }
  }
}

/** 500 (o cualquier otro estado de error que no sea 422). */
export class ApiServerError extends Error {
  readonly status: number;
  readonly errorCode?: string;

  constructor(status: number, detail: string, errorCode?: string) {
    super(detail);
    this.name = 'ApiServerError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

/* ------------------------------ Núcleo HTTP ------------------------------ */

interface OpcionesPeticion {
  metodo?: 'GET' | 'POST';
  cuerpo?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
}

async function peticion<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { metodo = 'GET', cuerpo, signal, timeoutMs = TIMEOUT_API_MS } = opciones;
  const controlador = new AbortController();
  let vencido = false;
  const temporizador = setTimeout(() => {
    vencido = true;
    controlador.abort();
  }, timeoutMs);

  // Une la señal de React Query (cancelación de peticiones obsoletas) con el timeout propio.
  const alAbortar = () => controlador.abort();
  if (signal) {
    if (signal.aborted) controlador.abort();
    else signal.addEventListener('abort', alAbortar, { once: true });
  }

  try {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: cuerpo !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: controlador.signal,
    });

    if (respuesta.ok) return (await respuesta.json()) as T;

    let cuerpoError: unknown = null;
    try {
      cuerpoError = await respuesta.json();
    } catch {
      cuerpoError = null;
    }
    if (respuesta.status === 422) {
      const detalle = (cuerpoError as ValidationErrorResponse | null)?.detail;
      const errores = (
        cuerpoError as { errors?: { campo: string; mensaje: string; tipo: string }[] } | null
      )?.errors;
      const items = Array.isArray(detalle)
        ? detalle
        : (errores ?? []).map((error) => ({
            loc: campoBackendALoc(error.campo),
            msg: error.mensaje,
            type: error.tipo,
          }));
      throw new ApiValidationError(items);
    }
    const err = cuerpoError as Partial<ErrorResponse> | null;
    throw new ApiServerError(
      respuesta.status,
      typeof err?.detail === 'string' ? err.detail : `Error ${respuesta.status} del backend`,
      err?.error_code,
    );
  } catch (error) {
    if (
      error instanceof ApiValidationError ||
      error instanceof ApiServerError ||
      error instanceof ApiTimeoutError ||
      error instanceof ApiNetworkError
    ) {
      throw error;
    }
    // Cancelada por el consumidor (React Query la ignora): se propaga como AbortError.
    if (signal?.aborted && !vencido) throw error;
    if (vencido) throw new ApiTimeoutError();
    // Nunca se deja salir un TypeError crudo de fetch.
    throw new ApiNetworkError();
  } finally {
    clearTimeout(temporizador);
    signal?.removeEventListener('abort', alAbortar);
  }
}

/** «config.poblacion» o «cromosoma[3]» → ['body', 'config', 'poblacion'] / ['body', 'cromosoma', 3]. */
function campoBackendALoc(campo: string): (string | number)[] {
  const loc: (string | number)[] = ['body'];
  for (const parte of campo.split('.')) {
    const coincidencia = /^(\w+)\[(\d+)]$/.exec(parte);
    if (coincidencia) loc.push(coincidencia[1], Number(coincidencia[2]));
    else loc.push(parte);
  }
  return loc;
}

/* ------------------------------ Endpoints ------------------------------ */

export const healthCheck = (signal?: AbortSignal) =>
  peticion<HealthResponse>('/health', { signal });

export const obtenerEscenario = (signal?: AbortSignal) =>
  peticion<Escenario>('/api/escenario', { signal });

export const evaluarHorario = (cromosoma: number[], pesoCosto?: number, signal?: AbortSignal) =>
  peticion<EvaluarResponse>('/api/evaluar', {
    metodo: 'POST',
    cuerpo: pesoCosto === undefined ? { cromosoma } : { cromosoma, peso_costo: pesoCosto },
    signal,
  });

export const ejecutar = (config: Partial<ConfigAG>, signal?: AbortSignal) =>
  peticion<Resultado>('/api/ejecutar', { metodo: 'POST', cuerpo: config, signal });

export const obtenerCorridas = (signal?: AbortSignal) =>
  peticion<Corrida[]>('/api/corridas', { signal });

/** La primera vez el backend ejecuta la corrida (unos segundos); luego la sirve de caché. */
export const obtenerResultadoCorrida = (id: number, signal?: AbortSignal) =>
  peticion<Resultado>(`/api/corridas/${id}`, { signal, timeoutMs: 60_000 });

export const compararTarifas = (cromosoma: number[] | null, signal?: AbortSignal) =>
  peticion<CompararTarifasResponse>('/api/tarifas/comparar', {
    metodo: 'POST',
    cuerpo: cromosoma ? { cromosoma } : {},
    signal,
  });

export const demoOperador = (cuerpo: DemoOperadorRequest, signal?: AbortSignal) =>
  peticion<DemoOperadorResponse>('/api/operadores/demo', { metodo: 'POST', cuerpo, signal });

/** URL del streaming SSE. `null` y `undefined` se omiten (el backend aplica sus valores por defecto). */
export function urlStream(config: ConfigAG, retardoMs: number): string {
  const q = new URLSearchParams();
  for (const [clave, valor] of Object.entries(config)) {
    if (valor === null || valor === undefined) continue;
    q.set(clave, String(valor));
  }
  q.set('retardo_ms', String(retardoMs));
  return `${API_URL}/api/ejecutar/stream?${q.toString()}`;
}
