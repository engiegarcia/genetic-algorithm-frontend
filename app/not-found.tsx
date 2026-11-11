import Link from 'next/link';
import { UnPanel } from '@/components/layout/Paneles';
import { clasesBoton } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <UnPanel ancho="max-w-xl">
      <div className="rounded-lg border border-border bg-surface/80 p-6">
        <h1 className="text-lg font-semibold text-ink">Página no encontrada</h1>
        <p className="mt-2 text-sm text-ink-muted">
          La dirección que abriste no existe en esta aplicación.
        </p>
        <Link href="/" className={clasesBoton('primario', 'mt-4')}>
          Ir al simulador
        </Link>
      </div>
    </UnPanel>
  );
}
