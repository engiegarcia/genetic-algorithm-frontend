import type { Config } from 'tailwindcss';

/** Cada color es un token semántico definido en app/globals.css como triplete "R G B". */
const token = (nombre: string) => `rgb(var(--${nombre}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    // Solo 3 radios en todo el proyecto: controles (md), cards (lg) y chips (full).
    borderRadius: { none: '0', md: '6px', lg: '10px', full: '9999px' },
    // Como máximo un nivel de sombra, solo para popovers y tooltips.
    boxShadow: { none: 'none', popover: '0 4px 16px rgb(0 0 0 / 0.14)' },
    // Escala tipográfica: 12/14/16/20/24/32 y 48 solo para la cifra principal.
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.25rem', { lineHeight: '1.75rem' }],
      xl: ['1.5rem', { lineHeight: '2rem' }],
      '2xl': ['2rem', { lineHeight: '2.5rem' }],
      kpi: ['3rem', { lineHeight: '3rem' }],
    },
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: {
          DEFAULT: token('surface'),
          raised: token('surface-raised'),
          sunken: token('surface-sunken'),
        },
        border: { DEFAULT: token('border'), strong: token('border-strong') },
        ink: { DEFAULT: token('ink'), muted: token('ink-muted'), faint: token('ink-faint') },
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover'),
          tint: token('accent-tint'),
          on: token('on-accent'),
        },
        danger: token('danger'),
        warning: token('warning'),
        success: token('success'),
        'nivel-1': token('nivel-1'),
        'nivel-2': token('nivel-2'),
        'nivel-3': token('nivel-3'),
        'nivel-4': token('nivel-4'),
        'nivel-5': token('nivel-5'),
        'curva-1': token('curva-1'),
        'curva-2': token('curva-2'),
        'curva-3': token('curva-3'),
        'curva-4': token('curva-4'),
        'curva-5': token('curva-5'),
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      transitionTimingFunction: {
        // Misma curva que lib/constants.ts (EASE_CSS).
        salida: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      ringOffsetColor: { canvas: token('canvas') },
    },
  },
  plugins: [],
};

export default config;
