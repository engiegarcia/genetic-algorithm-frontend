import { Icon, type IconProps } from './Icon';

/* Solo los glifos que cumplen una función: desplegar, confirmar, cerrar, tema, orden y control de la ejecución. */

/** Flecha hacia abajo; se rota por CSS para abrir/cerrar. */
export function Chevron(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9.5l6 6 6-6" />
    </Icon>
  );
}

export function Check(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5.5 12.5l4.5 4.5 8.5-9.5" />
    </Icon>
  );
}

export function Cerrar(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </Icon>
  );
}

/** Sol: círculo central y ocho marcas cortas. */
export function Sol(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M18 6l-1.4 1.4M7.4 16.6L6 18" />
    </Icon>
  );
}

/** Luna creciente. */
export function Luna(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19.5 14.2A7.5 7.5 0 0 1 9.8 4.5a7.5 7.5 0 1 0 9.7 9.7z" />
    </Icon>
  );
}

/** Marca de GitHub para enlaces al repositorio. */
export function GitHub({ size = 20, className, ...resto }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...resto}
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.683-.217.683-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.455-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.91.831.091-.647.349-1.087.636-1.337-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.295 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.848-2.338 4.695-4.566 4.943.359.31.678.92.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .269.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2z" />
    </svg>
  );
}

/** Indicador de orden en cabeceras de tabla. `direccion` null muestra ambas puntas atenuadas. */
export function Orden({ direccion, ...props }: IconProps & { direccion: 'asc' | 'desc' | null }) {
  return (
    <Icon {...props}>
      <path d="M8 10l4-4 4 4" opacity={direccion === 'desc' ? 0.3 : 1} />
      <path d="M8 14l4 4 4-4" opacity={direccion === 'asc' ? 0.3 : 1} />
    </Icon>
  );
}

/** Triángulo de reproducción: iniciar la ejecución. */
export function Reproducir(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 5.5v13l10.5-6.5z" />
    </Icon>
  );
}

/** Cuadrado: detener la ejecución. */
export function Detener(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
    </Icon>
  );
}

/** Dado: semilla aleatoria. */
export function Dado(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="3" />
      <circle cx="9" cy="9" r="0.75" fill="currentColor" />
      <circle cx="15" cy="15" r="0.75" fill="currentColor" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" />
    </Icon>
  );
}

/** Flecha circular: restablecer valores. */
export function Restablecer(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12a7 7 0 1 0 2.05-4.95" />
      <path d="M5 4.5v3.5h3.5" />
    </Icon>
  );
}
