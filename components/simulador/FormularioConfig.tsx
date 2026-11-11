'use client';

import type { ReactNode } from 'react';
import { Dado, Detener, Reproducir, Restablecer } from '@/components/icons/glifos';
import { Button } from '@/components/ui/Button';
import { Campo, Casilla } from '@/components/ui/Campo';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import {
  LIMITES,
  OPCIONES_CRUCE,
  OPCIONES_INICIALIZACION,
  OPCIONES_SELECCION,
  VELOCIDADES,
} from '@/lib/constants';
import { formatNumero, parseNumeroLocal } from '@/lib/format';
import type { FormConfig } from '@/lib/schemas';
import type { ConfigAG } from '@/types/api';

interface Props {
  formulario: FormConfig;
  errores: Partial<Record<keyof ConfigAG, string>>;
  onCambio: <K extends keyof FormConfig>(campo: K, valor: FormConfig[K]) => void;
  velocidad: string;
  onVelocidad: (valor: string) => void;
  ejecutando: boolean;
  onEjecutar: () => void;
  onDetener: () => void;
  onRestablecer: () => void;
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-1 text-sm font-semibold text-ink">{titulo}</legend>
      {children}
    </fieldset>
  );
}

function ConEtiqueta({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="etiqueta block" aria-hidden="true">
        {etiqueta}
      </span>
      {children}
    </div>
  );
}

export function FormularioConfig({
  formulario: f,
  errores,
  onCambio,
  velocidad,
  onVelocidad,
  ejecutando,
  onEjecutar,
  onDetener,
  onRestablecer,
}: Props) {
  const peso = parseNumeroLocal(f.peso_costo);
  const pesoValido = Number.isFinite(peso) ? Math.min(Math.max(peso, 0), 1) : 0.5;
  const valido = Object.keys(errores).length === 0;

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ejecutando && valido) onEjecutar();
      }}
      aria-label="Configuración del algoritmo genético"
    >
      <Seccion titulo="Objetivo">
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <label htmlFor="peso-costo" className="etiqueta">
              Peso del costo (w)
            </label>
            <span className="num text-sm text-ink">{formatNumero(pesoValido, 2)}</span>
          </div>
          <Slider
            id="peso-costo"
            value={pesoValido}
            min={LIMITES.peso_costo.min}
            max={LIMITES.peso_costo.max}
            step={LIMITES.peso_costo.paso}
            onChange={(v) => onCambio('peso_costo', formatNumero(v, 2))}
            valueText={`Costo ${Math.round(pesoValido * 100)} %, PADR ${Math.round((1 - pesoValido) * 100)} %`}
            disabled={ejecutando}
          />
          <p className="text-xs text-ink-faint">
            f = w·C/C<sub>hab</sub> + (1 − w)·PADR/PADR<sub>hab</sub>. Costo{' '}
            {Math.round(pesoValido * 100)} % · PADR {Math.round((1 - pesoValido) * 100)} %.
          </p>
          {errores.peso_costo ? <p className="text-xs text-danger">{errores.peso_costo}</p> : null}
        </div>
      </Seccion>

      <Seccion titulo="Operadores">
        <ConEtiqueta etiqueta="Cruce">
          <Select
            etiqueta="Cruce"
            valor={f.cruce}
            opciones={OPCIONES_CRUCE}
            onChange={(v) => onCambio('cruce', v as ConfigAG['cruce'])}
          />
        </ConEtiqueta>
        <div className="grid grid-cols-2 gap-3">
          <Campo
            etiqueta="pc"
            decimal
            valor={f.pc}
            onChange={(v) => onCambio('pc', v)}
            error={errores.pc}
            ayuda="Prob. de cruce"
          />
          <Campo
            etiqueta="pm"
            decimal
            valor={f.pm}
            onChange={(v) => onCambio('pm', v)}
            error={errores.pm}
            ayuda="Prob. de mutación"
          />
        </div>
      </Seccion>

      <Seccion titulo="Selección">
        <ConEtiqueta etiqueta="Método">
          <Select
            etiqueta="Método de selección"
            valor={f.seleccion}
            opciones={OPCIONES_SELECCION}
            onChange={(v) => onCambio('seleccion', v as ConfigAG['seleccion'])}
          />
        </ConEtiqueta>
        <div className="grid grid-cols-2 gap-3">
          {f.seleccion === 'torneo' ? (
            <Campo
              etiqueta="Tamaño (s)"
              valor={f.tamano_torneo}
              onChange={(v) => onCambio('tamano_torneo', v)}
              error={errores.tamano_torneo}
              ayuda="2 a 20"
            />
          ) : null}
          <Campo
            etiqueta="Elitismo (e)"
            valor={f.elitismo}
            onChange={(v) => onCambio('elitismo', v)}
            error={errores.elitismo}
            ayuda="Mejores que pasan"
          />
        </div>
      </Seccion>

      <Seccion titulo="Población">
        <ConEtiqueta etiqueta="Inicialización">
          <Select
            etiqueta="Inicialización"
            valor={f.inicializacion}
            opciones={OPCIONES_INICIALIZACION}
            onChange={(v) => onCambio('inicializacion', v as ConfigAG['inicializacion'])}
          />
        </ConEtiqueta>
        {f.inicializacion === 'voraz' ? (
          <Campo
            etiqueta="Fracción sembrada"
            decimal
            valor={f.fraccion_siembra}
            onChange={(v) => onCambio('fraccion_siembra', v)}
            error={errores.fraccion_siembra}
            ayuda="0,10 = 10 % de individuos voraces perturbados"
          />
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <Campo
            etiqueta="Tamaño (N)"
            valor={f.poblacion}
            onChange={(v) => onCambio('poblacion', v)}
            error={errores.poblacion}
            ayuda="4 a 1000"
          />
          <Campo
            etiqueta="Generaciones"
            valor={f.generaciones}
            onChange={(v) => onCambio('generaciones', v)}
            error={errores.generaciones}
            ayuda="0 a 5000"
          />
        </div>
        <Campo
          etiqueta="Semilla"
          valor={f.semilla}
          onChange={(v) => onCambio('semilla', v)}
          error={errores.semilla}
          ayuda="Misma semilla y configuración, mismo resultado"
          adorno={
            <Button
              variante="secundario"
              className="w-10 shrink-0 px-0"
              aria-label="Semilla aleatoria"
              title="Semilla aleatoria"
              onClick={() => onCambio('semilla', String(Math.floor(Math.random() * 100_000)))}
            >
              <Dado />
            </Button>
          }
        />
      </Seccion>

      <Seccion titulo="Parada">
        <Casilla
          etiqueta="Detener al alcanzar el óptimo demostrado"
          marcada={f.parar_en_optimo}
          onChange={(v) => onCambio('parar_en_optimo', v)}
          ayuda="Cuando el costo y el PADR igualan sus cotas inferiores."
        />
        <Campo
          etiqueta="Paciencia"
          valor={f.paciencia}
          onChange={(v) => onCambio('paciencia', v)}
          error={errores.paciencia}
          placeholder="Sin límite"
          ayuda="Generaciones sin mejora antes de detener; vacío = no aplica"
        />
      </Seccion>

      <Seccion titulo="Visualización">
        <ConEtiqueta etiqueta="Velocidad de la animación">
          <Select
            etiqueta="Velocidad de la animación"
            valor={velocidad}
            opciones={VELOCIDADES.map((v) => ({ valor: v.valor, etiqueta: v.etiqueta }))}
            onChange={onVelocidad}
          />
        </ConEtiqueta>
      </Seccion>

      <div className="sticky bottom-0 -mx-4 flex gap-2 border-t border-border bg-canvas/95 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
        {ejecutando ? (
          <Button variante="primario" className="flex-1" onClick={onDetener}>
            <Detener size={16} />
            Detener
          </Button>
        ) : (
          <Button type="submit" variante="primario" className="flex-1" disabled={!valido}>
            <Reproducir size={16} />
            Ejecutar
          </Button>
        )}
        <Button
          variante="secundario"
          onClick={onRestablecer}
          disabled={ejecutando}
          aria-label="Restablecer la configuración base"
          title="Restablecer la configuración base"
          className="w-10 px-0"
        >
          <Restablecer />
        </Button>
      </div>
    </form>
  );
}
