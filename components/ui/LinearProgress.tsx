import { cn } from '@/lib/cn';

/**
 * Barra de carga fina (2 px) en el borde superior del contenedor (que debe ser `relative`).
 * El invocante decide cuándo es visible (solo si la petición supera ~300 ms).
 */
export function LinearProgress({ visible, className }: { visible: boolean; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-label="Calculando"
      aria-hidden={!visible}
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden transition-opacity duration-150',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
    >
      <div className="barra-indeterminada h-full w-2/5 bg-accent" />
    </div>
  );
}
