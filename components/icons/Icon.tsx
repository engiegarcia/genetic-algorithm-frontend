import type { ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/cn';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Se dibujan solo a 16 o 20 px. */
  size?: 16 | 20;
}

interface BaseProps extends IconProps {
  children: ReactNode;
}

/**
 * Base de todos los iconos propios: rejilla de 24 px, trazo de 1,5 px, mismos remates y
 * esquinas, color heredado (`currentColor`). Decorativo por defecto (`aria-hidden`); si el
 * icono es el único contenido de un botón, el botón lleva `aria-label`.
 */
export function Icon({ size = 20, children, className, ...resto }: BaseProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...resto}
    >
      {children}
    </svg>
  );
}
