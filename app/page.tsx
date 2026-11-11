import { Suspense } from 'react';
import { SimuladorView } from '@/components/simulador/SimuladorView';

export default function PaginaSimulador() {
  // useSearchParams (?corrida=N) necesita un límite de Suspense para el prerenderizado estático.
  return (
    <Suspense>
      <SimuladorView />
    </Suspense>
  );
}
