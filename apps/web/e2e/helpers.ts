import type { Page } from '@playwright/test';

/**
 * Faz login com as credenciais do seed admin. Termina na rota raiz
 * (que redireciona para /dashboard).
 */
export async function login(
  page: Page,
  matricula = '0000000001',
  senha = 'Admin@123456',
): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Matrícula').fill(matricula);
  await page.getByLabel('Senha').fill(senha);
  await page.getByRole('button', { name: /entrar/i }).click();
  // Aguarda redirecionar para dashboard
  await page.waitForURL(/\/(dashboard)?$/, { timeout: 10_000 });
}
