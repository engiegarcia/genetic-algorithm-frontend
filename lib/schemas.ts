import { z } from 'zod';
import { LIMITES } from '@/lib/constants';
import { parseNumeroLocal } from '@/lib/format';
import type { ConfigAG } from '@/types/api';

/**
 * Espejo de las restricciones del backend (schemas/ag.py). Un valor fuera de rango es un error
 * visible: nunca se recorta en silencio, igual que el backend, que responde 422.
 */

const aNumero = (v: unknown): unknown => (typeof v === 'string' ? parseNumeroLocal(v) : v);

function numero(min: number, max: number, entero: boolean, nombre: string) {
  const invalido = `${nombre}: ingresa un número${entero ? ' entero' : ''}`;
  const rango = `${nombre}: debe estar entre ${String(min).replace('.', ',')} y ${String(max).replace('.', ',')}`;
  let base = z.number({ invalid_type_error: invalido, required_error: invalido }).finite(invalido);
  if (entero) base = base.int(invalido);
  return z.preprocess(aNumero, base.min(min, rango).max(max, rango));
}

/** Formulario: los campos numéricos llegan como texto (admite coma decimal). */
export const configSchema = z
  .object({
    peso_costo: numero(LIMITES.peso_costo.min, LIMITES.peso_costo.max, false, 'Peso del costo'),
    cruce: z.enum(['uniforme', 'un_punto', 'dos_puntos']),
    seleccion: z.enum(['torneo', 'ruleta']),
    tamano_torneo: numero(
      LIMITES.tamano_torneo.min,
      LIMITES.tamano_torneo.max,
      true,
      'Tamaño del torneo',
    ),
    inicializacion: z.enum(['aleatoria', 'voraz']),
    fraccion_siembra: numero(
      LIMITES.fraccion_siembra.min,
      LIMITES.fraccion_siembra.max,
      false,
      'Fracción sembrada',
    ),
    poblacion: numero(LIMITES.poblacion.min, LIMITES.poblacion.max, true, 'Población'),
    generaciones: numero(LIMITES.generaciones.min, LIMITES.generaciones.max, true, 'Generaciones'),
    pc: numero(LIMITES.pc.min, LIMITES.pc.max, false, 'Probabilidad de cruce'),
    pm: numero(LIMITES.pm.min, LIMITES.pm.max, false, 'Probabilidad de mutación'),
    elitismo: numero(LIMITES.elitismo.min, LIMITES.elitismo.max, true, 'Elitismo'),
    semilla: numero(LIMITES.semilla.min, LIMITES.semilla.max, true, 'Semilla'),
    paciencia: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? null : aNumero(v)),
      z
        .number({ invalid_type_error: 'Paciencia: ingresa un número entero o déjala vacía' })
        .finite('Paciencia: ingresa un número entero o déjala vacía')
        .int('Paciencia: ingresa un número entero o déjala vacía')
        .min(
          LIMITES.paciencia.min,
          `Paciencia: debe estar entre ${LIMITES.paciencia.min} y ${LIMITES.paciencia.max}`,
        )
        .max(
          LIMITES.paciencia.max,
          `Paciencia: debe estar entre ${LIMITES.paciencia.min} y ${LIMITES.paciencia.max}`,
        )
        .nullable(),
    ),
    parar_en_optimo: z.boolean(),
  })
  .superRefine((c, ctx) => {
    if (c.elitismo >= c.poblacion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['elitismo'],
        message: 'Elitismo: debe ser menor que la población',
      });
    }
    if (c.seleccion === 'torneo' && c.tamano_torneo > c.poblacion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tamano_torneo'],
        message: 'Tamaño del torneo: no puede superar la población',
      });
    }
    if (c.poblacion * (c.generaciones + 1) > LIMITES.maxEvaluaciones) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['generaciones'],
        message: `Población × (generaciones + 1) no puede superar ${LIMITES.maxEvaluaciones.toLocaleString('es-PE')} evaluaciones`,
      });
    }
  });

/** Estado del formulario: texto en los campos numéricos para conservar lo que escribe el usuario. */
export type FormConfig = {
  [K in keyof ConfigAG]: ConfigAG[K] extends number | null ? string : ConfigAG[K];
};

const aTexto = (v: number) => String(v).replace('.', ',');

export function configAFormulario(config: ConfigAG): FormConfig {
  return {
    ...config,
    peso_costo: aTexto(config.peso_costo),
    tamano_torneo: aTexto(config.tamano_torneo),
    fraccion_siembra: aTexto(config.fraccion_siembra),
    poblacion: aTexto(config.poblacion),
    generaciones: aTexto(config.generaciones),
    pc: aTexto(config.pc),
    pm: aTexto(config.pm),
    elitismo: aTexto(config.elitismo),
    semilla: aTexto(config.semilla),
    paciencia: config.paciencia === null ? '' : aTexto(config.paciencia),
  };
}

export type ResultadoValidacion =
  | { ok: true; config: ConfigAG }
  | { ok: false; errores: Partial<Record<keyof ConfigAG, string>> };

export function validarConfig(formulario: FormConfig): ResultadoValidacion {
  const r = configSchema.safeParse(formulario);
  if (r.success) return { ok: true, config: r.data as ConfigAG };
  const errores: Partial<Record<keyof ConfigAG, string>> = {};
  for (const issue of r.error.issues) {
    const campo = issue.path[0] as keyof ConfigAG | undefined;
    if (campo && !errores[campo]) errores[campo] = issue.message;
  }
  return { ok: false, errores };
}
