import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Navegação autenticada (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('sidebar contém todas as rotas principais', async ({ page }) => {
    const itens = ['Painel', 'Alertas', 'Veículos', 'Motoristas', 'Viagens', 'Usuários', 'Relatórios', 'Configurações'];
    for (const item of itens) {
      await expect(page.getByRole('link', { name: item })).toBeVisible();
    }
  });

  test('navegar para /viagens carrega a tabela', async ({ page }) => {
    await page.getByRole('link', { name: 'Viagens' }).click();
    await expect(page).toHaveURL(/\/viagens/);
    await expect(page.getByRole('heading', { name: /viagens/i })).toBeVisible();
  });

  test('navegar para /motoristas carrega a tabela', async ({ page }) => {
    await page.getByRole('link', { name: 'Motoristas' }).click();
    await expect(page).toHaveURL(/\/motoristas/);
    await expect(page.getByRole('heading', { name: /motoristas/i })).toBeVisible();
  });

  test('navegar para /alertas mostra título ou estado vazio', async ({ page }) => {
    await page.getByRole('link', { name: 'Alertas' }).click();
    await expect(page).toHaveURL(/\/alertas/);
    await expect(page.getByRole('heading', { name: /alertas/i })).toBeVisible();
  });

  test('navegar para /relatorios mostra cards de motorista e veículo', async ({ page }) => {
    await page.getByRole('link', { name: 'Relatórios' }).click();
    await expect(page).toHaveURL(/\/relatorios/);
    await expect(page.getByRole('heading', { name: /distância por motorista/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /distância por veículo/i })).toBeVisible();
  });

  test('botão sair limpa sessão e leva ao login', async ({ page }) => {
    await page.getByRole('button', { name: /sair/i }).click();
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await expect(page.getByLabel('Matrícula')).toBeVisible();
  });
});
