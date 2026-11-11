'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { CLAVE_ESCENARIO } from '@/hooks/useEscenario';
import { obtenerEscenario } from '@/lib/api';

export function Providers({ children }: { children: ReactNode }) {
  // El cliente se crea una sola vez por sesión del navegador (no en cada render).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
      }),
  );

  // Precarga del caso de estudio: ya está en caché al abrir cualquier vista.
  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: CLAVE_ESCENARIO,
      queryFn: ({ signal }) => obtenerEscenario(signal),
      staleTime: Infinity,
    });
  }, [queryClient]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="bottom-right" closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
