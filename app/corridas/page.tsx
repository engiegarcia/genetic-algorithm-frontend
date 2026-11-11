import type { Metadata } from 'next';
import { CorridasView } from '@/components/corridas/CorridasView';

export const metadata: Metadata = { title: 'Corridas' };

export default function PaginaCorridas() {
  return <CorridasView />;
}
