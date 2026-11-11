import { cn } from '@/lib/cn';

/** Bloque de carga con la forma del contenido final (se usa solo en la primera carga). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-surface-sunken motion-reduce:animate-none',
        className,
      )}
    />
  );
}
