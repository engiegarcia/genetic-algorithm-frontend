'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Input } from './Input';

interface CampoProps {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  error?: string;
  ayuda?: ReactNode;
  placeholder?: string;
  /** Contenido a la derecha del input (p. ej. un botón). */
  adorno?: ReactNode;
  decimal?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Campo numérico de texto: admite coma decimal y muestra el error debajo, sin recortar el valor. */
export function Campo({
  etiqueta,
  valor,
  onChange,
  error,
  ayuda,
  placeholder,
  adorno,
  decimal = false,
  disabled,
  className,
}: CampoProps) {
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const descritoPor =
    [error ? idError : null, ayuda ? idAyuda : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="etiqueta block">
        {etiqueta}
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          inputMode={decimal ? 'decimal' : 'numeric'}
          autoComplete="off"
          spellCheck={false}
          invalido={Boolean(error)}
          aria-describedby={descritoPor}
          placeholder={placeholder}
          disabled={disabled}
          className="num"
        />
        {adorno}
      </div>
      {error ? (
        <p id={idError} className="text-xs text-danger">
          {error}
        </p>
      ) : ayuda ? (
        <p id={idAyuda} className="text-xs text-ink-faint">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

/** Casilla de verificación nativa con el acento del tema. */
export function Casilla({
  etiqueta,
  marcada,
  onChange,
  ayuda,
  disabled,
}: {
  etiqueta: string;
  marcada: boolean;
  onChange: (marcada: boolean) => void;
  ayuda?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={marcada}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-md accent-[rgb(var(--accent))] disabled:cursor-not-allowed"
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
      />
      <div>
        <label htmlFor={id} className="cursor-pointer text-sm text-ink">
          {etiqueta}
        </label>
        {ayuda ? (
          <p id={`${id}-ayuda`} className="text-xs text-ink-faint">
            {ayuda}
          </p>
        ) : null}
      </div>
    </div>
  );
}
