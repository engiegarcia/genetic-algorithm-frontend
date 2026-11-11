import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

/*
 * Pruebas de extremo a extremo sin backend: las respuestas son capturas reales de la API
 * (e2e/fixtures), servidas con page.route. El streaming es un flujo SSE grabado que se detiene
 * al alcanzar el óptimo demostrado (población 60, parar_en_optimo).
 */

const fixture = (nombre: string) => readFileSync(path.join(__dirname, 'fixtures', nombre), 'utf-8');

async function simularApi(page: Page) {
  await page.route('**/api/escenario', (r) =>
    r.fulfill({ contentType: 'application/json', body: fixture('escenario.json') }),
  );
  await page.route('**/api/corridas', (r) =>
    r.fulfill({ contentType: 'application/json', body: fixture('corridas.json') }),
  );
  await page.route('**/api/evaluar', (r) =>
    r.fulfill({ contentType: 'application/json', body: fixture('evaluar-habitual.json') }),
  );
  await page.route('**/api/tarifas/comparar', (r) =>
    r.fulfill({ contentType: 'application/json', body: fixture('tarifas.json') }),
  );
  await page.route('**/api/ejecutar/stream**', (r) =>
    r.fulfill({
      status: 200,
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      body: fixture('stream.txt'),
    }),
  );
}

test('el simulador muestra el horario habitual y ejecuta hasta el óptimo demostrado', async ({
  page,
}) => {
  await simularApi(page);
  await page.goto('/');

  await expect(page.getByText('Horario habitual (sin ejecutar)')).toBeVisible();
  await expect(page.getByText('S/ 75,79').first()).toBeVisible();

  await page.getByRole('button', { name: 'Ejecutar' }).click();

  await expect(page.getByText('Óptimo demostrado alcanzado')).toBeVisible();
  await expect(page.getByText(/se detuvo al alcanzar el óptimo demostrado/)).toBeVisible();
  await expect(page.getByText('S/ 73,26').first()).toBeVisible();
  await expect(page.getByText('3,34 %').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ejecutar' })).toBeEnabled();
});

test('una configuración inválida deshabilita la ejecución y explica el límite', async ({
  page,
}) => {
  await simularApi(page);
  await page.goto('/');

  const poblacion = page.getByRole('textbox', { name: 'Tamaño (N)' });
  await poblacion.fill('2');
  await expect(page.getByText('Población: debe estar entre 4 y 1000')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ejecutar' })).toBeDisabled();

  await poblacion.fill('150');
  await expect(page.getByRole('button', { name: 'Ejecutar' })).toBeEnabled();
});

test('elegir una corrida del informe carga su configuración', async ({ page }) => {
  await simularApi(page);
  await page.goto('/');

  await page.getByRole('button', { name: /Corrida 3: selección por ruleta/ }).click();
  await expect(page.getByRole('combobox', { name: 'Método de selección' })).toHaveText(/Ruleta/);
  await expect(page.getByRole('textbox', { name: 'Tamaño (s)' })).toHaveCount(0);
});

test('el caso de estudio lista las 13 sesiones desplazables', async ({ page }) => {
  await simularApi(page);
  await page.goto('/caso');

  await expect(page.getByRole('heading', { name: 'Caso de estudio' })).toBeVisible();
  const tabla = page.getByRole('table', { name: /13 sesiones desplazables/ });
  await expect(tabla.getByRole('row')).toHaveCount(14);
  await expect(tabla.getByText('Lun–Vie 18:00–20:00; Sáb–Dom 08:00–17:00')).toBeVisible();
});
