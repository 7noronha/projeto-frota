import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Login', () => {
  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Matrícula').fill('0000000001');
    await page.getByLabel('Senha').fill('senhaerrada123');
    await page.getByRole('button', { name: /entrar/i }).click();

    // Espera o Alert de erro vir do backend
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 });
  });

  test('deve logar admin do seed e mostrar o painel', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/(dashboard)?$/);
    await expect(page.getByRole('heading', { name: /painel/i })).toBeVisible();
  });

  test('deve redirecionar para /login quando acessa rota privada sem token', async ({ page }) => {
    // Limpa cookies pra garantir não-autenticado
    await page.context().clearCookies();
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await expect(page.getByLabel('Matrícula')).toBeVisible();
  });

  test('deve validar formato de matrícula no cliente (Zod)', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Matrícula').fill('123');
    await page.getByLabel('Senha').fill('00000000');
    await page.getByRole('button', { name: /entrar/i }).click();
    // Mensagem do schemaLogin: 'Matrícula deve ter exatamente 10 dígitos'
    await expect(page.getByText(/10 dígitos/i)).toBeVisible();
  });
});
