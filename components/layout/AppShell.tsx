import type { ReactNode } from 'react';
import { Header } from './Header';

/** Layout de alto fijo: la app ocupa el viewport y el scroll vive dentro de cada panel, nunca en el body. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Header />
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
