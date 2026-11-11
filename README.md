# Franja: horario eléctrico con algoritmo genético (ODS 7)

Frontend en **Next.js 15 + React 19** del proyecto de Sistemas Inteligentes (UNMSM, Grupo 6). Muestra
en vivo cómo un algoritmo genético reprograma la terma, la lavadora, la plancha, la aspiradora y la
lustradora de una vivienda durante una semana para bajar el costo de la energía con la tarifa
**BT5-I** y la razón pico/promedio de la demanda (**PADR**), sin superar los **5000 W**.

Todo el cálculo vive en el backend
([genetic-algorithm-backend](https://github.com/angelariasus/genetic-algorithm-backend)); esta
interfaz consume su API REST y su streaming por **Server-Sent Events**.

## Vistas

| Ruta | Contenido |
|---|---|
| `/` Simulador | Configuración del AG (peso del costo, cruce, selección, población, generaciones, `pc`, `pm`, elitismo, semilla, criterios de parada) y ejecución en vivo: indicadores frente al horario habitual y a las cotas, horario semanal, demanda horaria con la franja punta, curva de convergencia y costo mensual BT5-I frente a BT5B |
| `/corridas` | Las cuatro corridas del informe con la semilla 2026: convergencia superpuesta y resultados; cada una se abre en el simulador (`/?corrida=N`) |
| `/operadores` | Cruce uniforme, de un punto, de dos puntos y mutación sobre dos horarios: cortes, máscara y gen editables, origen de cada gen y evaluación de padres e hijos |
| `/caso` | Datos oficiales (artefactos del MINEM, tarifa y bloques de Osinergmin, límite del CNE) y supuestos declarados del caso |
| `/acerca` | Método, parámetros con su respaldo y referencias en APA 7 |

## Requisitos e instalación

Node 22 o superior y pnpm 11.

```bash
pnpm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL = URL del backend, sin barra final
pnpm dev                           # http://localhost:3000
```

El backend debe permitir el origen del frontend en `CORS_ALLOWED_ORIGINS`.

## Scripts

| Comando | Uso |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` y `pnpm start` | Compilación y servidor de producción |
| `pnpm lint` | ESLint (incluye `jsx-a11y`), sin advertencias permitidas |
| `pnpm typecheck` | TypeScript estricto |
| `pnpm test` | Pruebas unitarias con Vitest (formato, validación, reductor del streaming, horario, operadores) |
| `pnpm e2e` | Pruebas de extremo a extremo con Playwright; la API se simula con respuestas reales grabadas en `e2e/fixtures`, así que no requieren backend |

## Estructura

```
app/                 Rutas (App Router)
components/
  simulador/         Formulario, indicadores, comparación de tarifas y vista principal
  horario/           Horario semanal y tabla de sesiones
  graficos/          Demanda horaria y convergencia (Recharts)
  corridas/ operadores/ caso/
  layout/ ui/ icons/ Shell, componentes base y glifos
hooks/               useEjecucionAG (EventSource), useEscenario, useServidorDespertando
lib/                 Cliente de la API, validación (zod), reductor SSE, formato y utilidades
types/api.ts         Contrato del backend
tests/ e2e/          Pruebas
```

### Streaming

`useEjecucionAG` abre un `EventSource` a `/api/ejecutar/stream`, acumula los eventos `generacion` y
los aplica una vez por frame, de modo que una corrida sin pausa no bloquea la interfaz. Cierra la
conexión en `fin`, en `onerror` (para que el navegador no reconecte y relance la corrida) y al
desmontar. El estado se calcula con un reductor puro (`lib/sse.ts`) cubierto por pruebas.

### Validación

`lib/schemas.ts` replica los límites del backend, incluidas las reglas cruzadas (elitismo menor que
la población, torneo no mayor que la población y como máximo un millón de evaluaciones). Un valor
fuera de rango se muestra como error y desactiva «Ejecutar»; nunca se recorta en silencio.

## Despliegue

Vercel: importar el repositorio y definir `NEXT_PUBLIC_API_URL` con la URL del backend en Render.
Si el backend está en un plan gratuito, la primera petición puede tardar mientras despierta; la
interfaz lo indica.

## Licencia

MIT.
