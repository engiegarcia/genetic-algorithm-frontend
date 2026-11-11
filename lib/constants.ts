import type { ConfigAG, Operador, TipoCruce, TipoInicializacion, TipoSeleccion } from '@/types/api';

/** Nombre de la app en un solo lugar. */
export const APP_NOMBRE = 'Franja';
export const APP_SUBTITULO = 'Algoritmo genético · Grupo 6 · UNMSM';
export const REPO_URL = 'https://github.com/engiegarcia/genetic-algorithm-frontend';

/** Curva de easing única de todo el proyecto (igual que Matiz). */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_CSS = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const TIMEOUT_API_MS = 15_000;
/** Si /health tarda más que esto, se muestra que el servidor está despertando (Render). */
export const AVISO_DESPERTAR_MS = 3_000;
export const RETRASO_BARRA_CARGA_MS = 300;

export const NAVEGACION = [
  { href: '/', texto: 'Simulador' },
  { href: '/corridas', texto: 'Corridas' },
  { href: '/operadores', texto: 'Operadores' },
  { href: '/caso', texto: 'Caso de estudio' },
  { href: '/acerca', texto: 'Acerca del método' },
] as const;

/** Configuración base del informe (sección 6.4). Coincide con los valores por defecto del backend. */
export const CONFIG_BASE: ConfigAG = {
  peso_costo: 0.5,
  cruce: 'uniforme',
  seleccion: 'torneo',
  tamano_torneo: 3,
  inicializacion: 'aleatoria',
  fraccion_siembra: 0.1,
  poblacion: 150,
  generaciones: 500,
  pc: 0.8,
  pm: 0.1,
  elitismo: 1,
  semilla: 2026,
  paciencia: null,
  parar_en_optimo: false,
};

/** Límites del backend (schemas/ag.py). El backend rechaza con 422; aquí se validan antes. */
export const LIMITES = {
  peso_costo: { min: 0, max: 1, paso: 0.05 },
  tamano_torneo: { min: 2, max: 20, paso: 1 },
  fraccion_siembra: { min: 0, max: 1, paso: 0.05 },
  poblacion: { min: 4, max: 1000, paso: 1 },
  generaciones: { min: 0, max: 5000, paso: 10 },
  pc: { min: 0, max: 1, paso: 0.05 },
  pm: { min: 0, max: 1, paso: 0.01 },
  elitismo: { min: 0, max: 50, paso: 1 },
  semilla: { min: 0, max: 4_294_967_295 },
  paciencia: { min: 1, max: 5000 },
  maxEvaluaciones: 1_000_000,
} as const;

export const OPCIONES_CRUCE: { valor: TipoCruce; etiqueta: string }[] = [
  { valor: 'uniforme', etiqueta: 'Uniforme' },
  { valor: 'un_punto', etiqueta: 'Un punto' },
  { valor: 'dos_puntos', etiqueta: 'Dos puntos' },
];
export const OPCIONES_SELECCION: { valor: TipoSeleccion; etiqueta: string }[] = [
  { valor: 'torneo', etiqueta: 'Torneo (reglas de Deb)' },
  { valor: 'ruleta', etiqueta: 'Ruleta (aptitud de Deb)' },
];
export const OPCIONES_INICIALIZACION: { valor: TipoInicializacion; etiqueta: string }[] = [
  { valor: 'aleatoria', etiqueta: 'Aleatoria' },
  { valor: 'voraz', etiqueta: 'Siembra voraz parcial' },
];
export const OPCIONES_OPERADOR: { valor: Operador; etiqueta: string }[] = [
  { valor: 'uniforme', etiqueta: 'Cruce uniforme' },
  { valor: 'un_punto', etiqueta: 'Cruce de un punto' },
  { valor: 'dos_puntos', etiqueta: 'Cruce de dos puntos' },
  { valor: 'mutacion', etiqueta: 'Mutación uniforme' },
];

/** Pausa entre generaciones del streaming (ms). Una corrida completa dura menos de 1 s sin pausa. */
export const VELOCIDADES = [
  { valor: '0', etiqueta: 'Instantánea', ms: 0 },
  { valor: '5', etiqueta: 'Rápida', ms: 5 },
  { valor: '20', etiqueta: 'Normal', ms: 20 },
  { valor: '60', etiqueta: 'Lenta', ms: 60 },
] as const;
export const VELOCIDAD_POR_DEFECTO = '20';

export const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
export const DIAS_LARGOS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

/** Color de cada artefacto desplazable en el horario (tokens curva-N del tema). */
export const COLOR_ARTEFACTO: Record<string, string> = {
  'Terma eléctrica': 'rgb(var(--curva-1))',
  Lavadora: 'rgb(var(--curva-2))',
  'Plancha eléctrica': 'rgb(var(--curva-3))',
  Aspiradora: 'rgb(var(--curva-4))',
  Lustradora: 'rgb(var(--curva-5))',
};
export const NOMBRE_CORTO: Record<string, string> = {
  'Terma eléctrica': 'Terma',
  Lavadora: 'Lavadora',
  'Plancha eléctrica': 'Plancha',
  Aspiradora: 'Aspiradora',
  Lustradora: 'Lustradora',
};

export const TEXTO_MOTIVO: Record<string, string> = {
  generaciones: 'completó las generaciones',
  estancamiento: 'se detuvo por estancamiento',
  optimo: 'se detuvo al alcanzar el óptimo demostrado',
};
