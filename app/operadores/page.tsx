import type { Metadata } from 'next';
import { OperadoresView } from '@/components/operadores/OperadoresView';

export const metadata: Metadata = { title: 'Operadores' };

export default function PaginaOperadores() {
  return <OperadoresView />;
}
