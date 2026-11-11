import type { Metadata } from 'next';
import { CasoView } from '@/components/caso/CasoView';

export const metadata: Metadata = { title: 'Caso de estudio' };

export default function PaginaCaso() {
  return <CasoView />;
}
