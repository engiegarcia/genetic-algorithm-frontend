'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Marca } from '@/components/icons/Marca';
import { GitHub } from '@/components/icons/glifos';
import { APP_NOMBRE, APP_SUBTITULO, NAVEGACION, REPO_URL } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const ruta = usePathname();
  return (
    <header className="flex-shrink-0 border-b border-border bg-surface">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-md text-accent">
          <Marca />
          <span className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-ink">{APP_NOMBRE}</span>
            <span className="hidden text-xs text-ink-faint md:block">{APP_SUBTITULO}</span>
          </span>
        </Link>
        {/* Navegación solo con texto, en una línea; en pantallas angostas se desplaza horizontalmente. */}
        <nav
          aria-label="Principal"
          className="scroll-panel ml-2 hidden min-w-0 flex-1 gap-1 overflow-x-auto lg:flex"
        >
          {NAVEGACION.map((item) => {
            const activa = item.href === '/' ? ruta === '/' : ruta.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={activa ? 'page' : undefined}
                className={cn(
                  'inline-flex h-10 items-center whitespace-nowrap rounded-md px-3 text-sm transition-colors duration-150 ease-salida',
                  activa
                    ? 'bg-accent-tint/50 font-medium text-ink'
                    : 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
                )}
              >
                {item.texto}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir repositorio en GitHub"
            title="Repositorio en GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 ease-salida hover:bg-surface-sunken hover:text-ink"
          >
            <GitHub />
          </a>
          <ThemeToggle />
        </div>
      </div>
      <nav
        aria-label="Principal (móvil)"
        className="scroll-panel flex gap-1 overflow-x-auto border-t border-border px-2 lg:hidden"
      >
        {NAVEGACION.map((item) => {
          const activa = item.href === '/' ? ruta === '/' : ruta.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={activa ? 'page' : undefined}
              className={cn(
                'inline-flex h-10 items-center whitespace-nowrap rounded-md px-3 text-sm transition-colors duration-150 ease-salida',
                activa ? 'font-medium text-ink' : 'text-ink-muted hover:text-ink',
              )}
            >
              {item.texto}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
