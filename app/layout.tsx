import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Providers } from '@/components/Providers';
import './globals.css';

/** DM Sans es la única tipografía de la interfaz, incluidos números y valores. */
const sans = DM_Sans({ subsets: ['latin', 'latin-ext'], display: 'swap', variable: '--font-sans' });

export const metadata: Metadata = {
  title: { default: 'Franja · Horario eléctrico con algoritmo genético', template: '%s · Franja' },
  description:
    'Algoritmo genético que programa el uso semanal de los electrodomésticos de una vivienda para reducir el costo con la tarifa BT5-I y la razón pico/promedio (ODS 7).',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={sans.variable}>
      <body className="h-dvh overflow-hidden bg-canvas text-ink antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
