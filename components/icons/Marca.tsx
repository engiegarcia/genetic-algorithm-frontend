/**
 * Marca gráfica: tres franjas horarias desplazadas, como sesiones en un horario semanal.
 * La franja central lleva el tinte del acento; en monocromo se lee igual por el contorno.
 */
export function Marca({ size = 24, className }: { size?: number; className?: string }) {
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
      className={className}
    >
      <rect x="3" y="4.5" width="9" height="4" rx="1.25" />
      <rect x="8" y="10" width="13" height="4" rx="1.25" fill="rgb(var(--accent-tint))" />
      <rect x="5" y="15.5" width="7" height="4" rx="1.25" />
    </svg>
  );
}
