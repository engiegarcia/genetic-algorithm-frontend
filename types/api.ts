/* Tipos del contrato del backend (genetic-algorithm-backend, README «Contrato de la API»). */

export type TipoCruce = 'uniforme' | 'un_punto' | 'dos_puntos';
export type TipoSeleccion = 'torneo' | 'ruleta';
export type TipoInicializacion = 'aleatoria' | 'voraz';
export type MotivoParada = 'generaciones' | 'estancamiento' | 'optimo';
export type Bloque = 'base' | 'media' | 'punta';

export interface ConfigAG {
  peso_costo: number;
  cruce: TipoCruce;
  seleccion: TipoSeleccion;
  tamano_torneo: number;
  inicializacion: TipoInicializacion;
  fraccion_siembra: number;
  poblacion: number;
  generaciones: number;
  pc: number;
  pm: number;
  elitismo: number;
  semilla: number;
  paciencia: number | null;
  parar_en_optimo: boolean;
}

export interface Evaluacion {
  costo: number;
  padr: number;
  pico_w: number;
  energia_punta_kwh: number;
  violacion_kwh: number;
  objetivo: number;
  factible: boolean;
}

export interface Artefacto {
  nombre: string;
  potencia_w: number;
  horas: number;
  frecuencia: 'dia' | 'semana';
  horas_semana: number;
  desplazable: boolean;
}

export interface Tarea {
  indice: number;
  artefacto: string;
  sesion: number;
  potencia_w: number;
  duracion: number;
  /** Horas de la semana (0 = lunes 00:00) en que puede comenzar la sesión. */
  inicios: number[];
  habitual: number;
}

export interface Escenario {
  dias: string[];
  bloques: Record<Bloque, [number, number]>;
  cargos_ctm_kwh: Record<Bloque, number>;
  cargo_fijo_soles_mes: number;
  limite_w: number;
  precios_kwh: number[];
  perfil_fijo: number[];
  artefactos: Artefacto[];
  tareas: Tarea[];
  habitual: Evaluacion;
  habitual_cromosoma: number[];
  cota_costo: number;
  padr_minimo: number;
  objetivo_minimo: number;
  espacio_busqueda: string;
  fuentes: Record<string, string>;
}

export interface PuntoHistorial {
  generacion: number;
  objetivo: number;
  objetivo_promedio: number;
  costo: number;
  padr: number;
  violacion_kwh: number;
  factibles: number;
}

export interface Resultado {
  config: ConfigAG;
  mejor_cromosoma: number[];
  mejor_inicios: number[];
  mejor: Evaluacion;
  perfil: number[];
  ahorro_pct: number;
  optimo_alcanzado: boolean;
  generacion_mejor: number;
  evaluaciones: number;
  sembrados: number;
  tiempo_s: number;
  generaciones_ejecutadas: number;
  motivo_parada: MotivoParada;
  historial: PuntoHistorial[];
}

export interface Corrida {
  id: number;
  nombre: string;
  descripcion: string;
  cambio: string;
  config: ConfigAG;
}

export interface EvaluarResponse {
  evaluacion: Evaluacion;
  inicios: number[];
  perfil: number[];
}

export interface CostoTarifa {
  opcion: 'BT5-I' | 'BT5B';
  cargos_ctm_kwh: Record<string, number>;
  energia_semanal_soles: number;
  energia_mensual_soles: number;
  cargo_fijo_mensual_soles: number;
  total_mensual_soles: number;
}

export interface CompararTarifasResponse {
  cromosoma: number[];
  energia_semanal_kwh: number;
  bt5i: CostoTarifa;
  bt5b: CostoTarifa;
  diferencia_mensual_soles: number;
  ahorro_bt5i_pct: number;
  nota: string;
  fuente: string;
}

export type Operador = 'uniforme' | 'un_punto' | 'dos_puntos' | 'mutacion';

export interface DemoOperadorRequest {
  operador: Operador;
  padre1?: number[];
  padre2?: number[];
  corte1?: number;
  corte2?: number;
  mascara?: boolean[];
  gen?: number;
  valor?: number;
  semilla?: number;
}

export interface HijoDemo {
  cromosoma: number[];
  inicios: number[];
  evaluacion: Evaluacion;
}

export interface DemoOperadorResponse {
  operador: Operador;
  padre1: number[];
  padre2: number[] | null;
  detalle: Record<string, unknown>;
  hijos: HijoDemo[];
  explicacion: string;
  fuente: string;
}

/* ------------------------------ Streaming (SSE) ------------------------------ */

export interface EventoInicio {
  config: ConfigAG;
  habitual: Evaluacion;
  generaciones_maximas: number;
  cota_costo: number;
  padr_minimo: number;
  objetivo_minimo: number;
  evaluaciones_totales: number;
}

export interface EventoGeneracion extends Evaluacion {
  generacion: number;
  objetivo_promedio: number;
  factibles: number;
  mejoro: boolean;
  evaluaciones: number;
  mejor_cromosoma?: number[];
  mejor_inicios?: number[];
  perfil?: number[];
}

export interface EventoFin extends Evaluacion {
  generacion_mejor: number;
  mejor_cromosoma: number[];
  mejor_inicios: number[];
  perfil: number[];
  ahorro_pct: number;
  optimo_alcanzado: boolean;
  evaluaciones: number;
  generaciones_ejecutadas: number;
  motivo_parada: MotivoParada;
  sembrados: number;
}

/* ------------------------------ Errores ------------------------------ */

export interface ErrorResponse {
  detail: string;
  error_code: string;
  errors?: { campo: string; mensaje: string; tipo: string }[];
}

export interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ValidationErrorResponse {
  detail: ValidationErrorItem[];
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  version: string;
}
