import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config para os testes E2E.
 *
 * Os testes assumem:
 * - API rodando em http://localhost:3001 (com seed admin: 0000000001/Admin@123456)
 * - Web rodando em http://localhost:3000
 *
 * Para rodar localmente:
 *   1. Em um terminal: `bun run dev:app` (turbo dev de api + web)
 *   2. Em outro: `cd apps/web && bun run e2e`
 *
 * Em CI o webServer abaixo sobe o web automaticamente, mas a API
 * precisa estar de pé externamente (ou adicionar mais um webServer).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false, // testes mexem em dados — serializar
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
