import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type FormEvent,
  type InputHTMLAttributes,
  type MutableRefObject,
} from 'react';
import { cn } from '@/lib/cn';

interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'onInput'> {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (valor: number) => void;
  /** Texto que lee el lector de pantalla (p. ej. la hora como HH:MM). */
  valueText?: string;
}

/**
 * Slider nativo y no controlado durante el arrastre. El navegador mueve el thumb y pinta la
 * pista sin esperar un render de React; el formulario recibe como máximo una actualización por
 * frame. `value` solo sincroniza cambios externos (texto o casos de ejemplo).
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { value, min, max, step, onChange, valueText, className, ...resto },
  forwardedRef,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const ultimoValorRef = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const porcentaje = useCallback(
    (valor: number) =>
      max > min ? ((Math.min(Math.max(valor, min), max) - min) / (max - min)) * 100 : 0,
    [max, min],
  );

  const asignarRef = useCallback(
    (nodo: HTMLInputElement | null) => {
      inputRef.current = nodo;
      if (typeof forwardedRef === 'function') forwardedRef(nodo);
      else if (forwardedRef)
        (forwardedRef as MutableRefObject<HTMLInputElement | null>).current = nodo;
    },
    [forwardedRef],
  );

  // Sincroniza escritura en el input de texto y selección de casos sin controlar cada tick.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.value = String(value);
    input.style.setProperty('--pct', `${porcentaje(value)}%`);
    ultimoValorRef.current = value;
  }, [value, porcentaje]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const alMover = (evento: FormEvent<HTMLInputElement>) => {
    const input = evento.currentTarget;
    const siguiente = Number(input.value);
    ultimoValorRef.current = siguiente;
    // La pista sigue al puntero inmediatamente, incluso si React está renderizando otra vista.
    input.style.setProperty('--pct', `${porcentaje(siguiente)}%`);
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      onChangeRef.current(ultimoValorRef.current);
    });
  };

  return (
    <input
      ref={asignarRef}
      type="range"
      min={min}
      max={max}
      step={step}
      defaultValue={value}
      aria-valuetext={valueText}
      onInput={alMover}
      style={{ '--pct': `${porcentaje(value)}%` } as CSSProperties}
      className={cn('slider', className)}
      {...resto}
    />
  );
});
