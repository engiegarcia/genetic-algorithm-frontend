import { describe, expect, it } from 'vitest';
import { urlStream } from '@/lib/api';
import { CONFIG_BASE, DIAS_CORTOS } from '@/lib/constants';
import { formatNumero, formatSoles, horaSemana, parseNumeroLocal, rangoSesion } from '@/lib/format';
import { bloqueDeHora, decodificar, describirInicios, energiaPorBloque } from '@/lib/horario';
import { origenGenes, posicionesCorte } from '@/lib/operadores';
import { configAFormulario, validarConfig } from '@/lib/schemas';
import { ESTADO_INICIAL, reductor, submuestrear } from '@/lib/sse';
import type { EventoFin, EventoGeneracion, EventoInicio, Evaluacion, Tarea } from '@/types/api';

describe('formato', () => {
  it('usa coma decimal y separa miles solo desde 10 000', () => {
    expect(formatNumero(75.791264, 2)).toBe('75,79');
    expect(formatNumero(7542, 0)).toBe('7542');
    expect(formatNumero(10504, 0)).toBe('10 504');
    expect(formatNumero(-0.001, 2)).toBe('0,00');
    expect(formatSoles(329.2497)).toBe('S/ 329,25');
  });

  it('convierte horas de la semana a día y hora', () => {
    expect(horaSemana(0)).toBe('Lun 00:00');
    expect(horaSemana(18)).toBe('Lun 18:00');
    expect(horaSemana(167, true)).toBe('Domingo 23:00');
    expect(rangoSesion(136, 3)).toBe('16:00–19:00');
  });

  it('lee números con coma o punto y rechaza texto', () => {
    expect(parseNumeroLocal('0,8')).toBe(0.8);
    expect(parseNumeroLocal(' 150 ')).toBe(150);
    expect(parseNumeroLocal('1e3')).toBeNaN();
    expect(parseNumeroLocal('')).toBeNaN();
  });
});

describe('horario', () => {
  it('asigna los bloques BT5-I: base 23–08, media 08–18, punta 18–23', () => {
    expect(bloqueDeHora(7)).toBe('base');
    expect(bloqueDeHora(8)).toBe('media');
    expect(bloqueDeHora(17)).toBe('media');
    expect(bloqueDeHora(18)).toBe('punta');
    expect(bloqueDeHora(22)).toBe('punta');
    expect(bloqueDeHora(23)).toBe('base');
    expect(bloqueDeHora(24 + 19)).toBe('punta');
  });

  it('decodifica índices a horas de inicio', () => {
    const tareas = [{ inicios: [4, 5, 18] }, { inicios: [30, 42] }] as unknown as Tarea[];
    expect(decodificar(tareas, [2, 0])).toEqual([18, 30]);
  });

  it('describe franjas agrupando días con el mismo rango', () => {
    const terma = [4, 5, 6, 7, 18, 19, 20, 21, 22];
    expect(describirInicios(terma, DIAS_CORTOS)).toBe('Lun 04:00–07:00 y 18:00–22:00');
    const semana = [0, 1, 2, 3, 4]
      .flatMap((d) => [d * 24 + 18, d * 24 + 19])
      .concat([5 * 24 + 8, 6 * 24 + 8]);
    expect(describirInicios(semana, DIAS_CORTOS)).toBe('Lun–Vie 18:00–19:00; Sáb–Dom 08:00');
  });

  it('suma la energía por bloque en kWh', () => {
    const perfil = Array<number>(168).fill(0);
    perfil[18] = 1500;
    perfil[3] = 1000;
    perfil[10] = 500;
    expect(energiaPorBloque(perfil)).toEqual({ base: 1, media: 0.5, punta: 1.5 });
  });
});

describe('validación de la configuración', () => {
  it('acepta la configuración base del informe', () => {
    const r = validarConfig(configAFormulario(CONFIG_BASE));
    expect(r).toEqual({ ok: true, config: CONFIG_BASE });
  });

  it('admite coma decimal y paciencia vacía', () => {
    const f = { ...configAFormulario(CONFIG_BASE), pm: '0,05', paciencia: '' };
    const r = validarConfig(f);
    expect(r.ok && r.config.pm).toBe(0.05);
    expect(r.ok && r.config.paciencia).toBeNull();
  });

  it('rechaza valores fuera de rango sin recortarlos', () => {
    const r = validarConfig({
      ...configAFormulario(CONFIG_BASE),
      poblacion: '2',
      pc: '1,5',
      paciencia: '0',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errores.poblacion).toMatch(/entre 4 y 1000/);
      expect(r.errores.pc).toMatch(/entre 0 y 1/);
      expect(r.errores.paciencia).toBeDefined();
    }
  });

  it('replica las reglas cruzadas del backend', () => {
    const base = configAFormulario(CONFIG_BASE);
    const elitismo = validarConfig({ ...base, poblacion: '10', elitismo: '10' });
    expect(!elitismo.ok && elitismo.errores.elitismo).toMatch(/menor que la población/);
    const torneo = validarConfig({ ...base, poblacion: '10', tamano_torneo: '12' });
    expect(!torneo.ok && torneo.errores.tamano_torneo).toMatch(/no puede superar/);
    const evaluaciones = validarConfig({ ...base, poblacion: '1000', generaciones: '1000' });
    expect(!evaluaciones.ok && evaluaciones.errores.generaciones).toMatch(/evaluaciones/);
    // La ruleta no usa el tamaño de torneo.
    expect(
      validarConfig({ ...base, poblacion: '10', tamano_torneo: '12', seleccion: 'ruleta' }).ok,
    ).toBe(true);
  });
});

describe('URL del streaming', () => {
  it('serializa la configuración y omite la paciencia nula', () => {
    const url = new URL(urlStream(CONFIG_BASE, 20));
    expect(url.pathname).toBe('/api/ejecutar/stream');
    expect(url.searchParams.get('cruce')).toBe('uniforme');
    expect(url.searchParams.get('pm')).toBe('0.1');
    expect(url.searchParams.get('parar_en_optimo')).toBe('false');
    expect(url.searchParams.get('retardo_ms')).toBe('20');
    expect(url.searchParams.has('paciencia')).toBe(false);
  });
});

const evaluacion: Evaluacion = {
  costo: 74,
  padr: 6.4,
  pico_w: 4800,
  energia_punta_kwh: 50,
  violacion_kwh: 0,
  objetivo: 1,
  factible: true,
};

function generacion(g: number, extra: Partial<EventoGeneracion> = {}): EventoGeneracion {
  return {
    ...evaluacion,
    generacion: g,
    objetivo_promedio: 1.1,
    factibles: 5,
    mejoro: false,
    evaluaciones: g * 10,
    ...extra,
  };
}

describe('reductor del streaming', () => {
  const inicio = { config: CONFIG_BASE, generaciones_maximas: 500 } as EventoInicio;

  it('recorre conectar → inicio → generaciones → fin', () => {
    let s = reductor(ESTADO_INICIAL, { tipo: 'conectar', config: CONFIG_BASE });
    expect(s.fase).toBe('conectando');
    s = reductor(s, { tipo: 'inicio', datos: inicio });
    expect(s.fase).toBe('ejecutando');
    s = reductor(s, {
      tipo: 'generaciones',
      datos: [
        generacion(0, { mejoro: true, mejor_cromosoma: [1], mejor_inicios: [10], perfil: [0] }),
        generacion(1),
        generacion(2, { mejoro: true, mejor_cromosoma: [2], mejor_inicios: [20], perfil: [1] }),
      ],
    });
    expect(s.serie).toHaveLength(3);
    expect(s.ultimo?.generacion).toBe(2);
    expect(s.mejor).toEqual({ generacion: 2, cromosoma: [2], inicios: [20], perfil: [1] });

    const fin = {
      generacion_mejor: 2,
      mejor_cromosoma: [3],
      mejor_inicios: [30],
      perfil: [2],
    } as EventoFin;
    s = reductor(s, { tipo: 'fin', datos: fin });
    expect(s.fase).toBe('terminado');
    expect(s.mejor?.cromosoma).toEqual([3]);
  });

  it('conserva la generación del mejor cuando la última generación no mejora', () => {
    let s = reductor(ESTADO_INICIAL, { tipo: 'conectar', config: CONFIG_BASE });
    s = reductor(s, {
      tipo: 'generaciones',
      datos: [
        generacion(0, { mejoro: true, mejor_cromosoma: [1], mejor_inicios: [10], perfil: [0] }),
      ],
    });
    s = reductor(s, {
      tipo: 'generaciones',
      datos: [
        generacion(9, { mejoro: false, mejor_cromosoma: [1], mejor_inicios: [10], perfil: [0] }),
      ],
    });
    expect(s.mejor?.generacion).toBe(0);
  });

  it('ignora eventos tardíos después de detener', () => {
    let s = reductor(ESTADO_INICIAL, { tipo: 'conectar', config: CONFIG_BASE });
    s = reductor(s, { tipo: 'detener' });
    expect(s.fase).toBe('detenido');
    const despues = reductor(s, { tipo: 'generaciones', datos: [generacion(5)] });
    expect(despues).toBe(s);
    expect(reductor(s, { tipo: 'error', mensaje: 'x' })).toBe(s);
  });

  it('submuestrea series largas conservando el último punto', () => {
    const serie = Array.from({ length: 5001 }, (_, i) => i);
    const r = submuestrear(serie, 600);
    expect(r.length).toBeLessThanOrEqual(601);
    expect(r[0]).toBe(0);
    expect(r[r.length - 1]).toBe(5000);
    expect(submuestrear([1, 2, 3], 600)).toEqual([1, 2, 3]);
  });
});

describe('origen de los genes en los operadores', () => {
  it('un punto: el hijo 1 toma la cola del padre 2 desde el corte', () => {
    const [h1, h2] = origenGenes('un_punto', { corte: 2 }, 4);
    expect(h1).toEqual(['p1', 'p1', 'p2', 'p2']);
    expect(h2).toEqual(['p2', 'p2', 'p1', 'p1']);
    expect(posicionesCorte('un_punto', { corte: 2 })).toEqual([2]);
  });

  it('dos puntos: intercambia el segmento [corte1, corte2)', () => {
    // Mismo caso que devuelve el backend: cortes 7 y 10 sobre 13 genes.
    const [h1] = origenGenes('dos_puntos', { corte1: 7, corte2: 10 }, 13);
    expect(h1.map((o, j) => (o === 'p2' ? j : null)).filter((j) => j !== null)).toEqual([7, 8, 9]);
  });

  it('uniforme: intercambia donde la máscara es verdadera', () => {
    const [h1, h2] = origenGenes('uniforme', { mascara: [true, false, true] }, 3);
    expect(h1).toEqual(['p2', 'p1', 'p2']);
    expect(h2).toEqual(['p1', 'p2', 'p1']);
  });

  it('mutación: un solo hijo con un gen mutado', () => {
    const hijos = origenGenes('mutacion', { gen: 1 }, 3);
    expect(hijos).toEqual([['p1', 'mutado', 'p1']]);
  });
});
