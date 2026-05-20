import { test, expect, type Page } from '@playwright/test';
import { login } from './helpers';

/**
 * Fluxo crítico de viagens — criar → iniciar → finalizar.
 *
 * Pré-requisitos (além do seed base):
 *  - Pelo menos 1 motorista ativo com CNH válida no banco
 *  - Pelo menos 1 veículo ativo
 *
 * Use `cd apps/api && bunx tsx prisma/seed-motorista-teste.ts` para criar
 * motorista 0000001234 + 1 veículo se ainda não existirem.
 *
 * Para evitar conflito de horário com viagens prévias, usamos uma data
 * distante (60 dias à frente) e uma janela curta única por execução.
 */

function dataFuturaISO(diasAFrente: number): string {
  const d = new Date();
  d.setDate(d.getDate() + diasAFrente);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function horaUnica(): { inicio: string; fim: string } {
  // Janela de 30 min entre 02:00 e 05:30 (horários raros — baixa colisão)
  const totalMinutos = Math.floor(Math.random() * 7) * 30 + 120; // 120..300
  const h = Math.floor(totalMinutos / 60);
  const m = totalMinutos % 60;
  const inicio = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const fimH = Math.floor((totalMinutos + 30) / 60);
  const fimM = (totalMinutos + 30) % 60;
  const fim = `${String(fimH).padStart(2, '0')}:${String(fimM).padStart(2, '0')}`;
  return { inicio, fim };
}

async function selecionarPrimeiroDoSelect(page: Page, rotulo: string): Promise<void> {
  // SelectField do lojascem-components-react: o trigger é um botão acessível
  // pelo nome do label. Clicar abre a listbox; depois seleciona a primeira opção.
  const trigger = page.getByRole('button', { name: new RegExp(rotulo, 'i') }).first();
  await trigger.click();
  // Aguarda a listbox abrir e pega a primeira opção
  const opcao = page.getByRole('option').first();
  await opcao.waitFor({ state: 'visible', timeout: 5_000 });
  await opcao.click();
}

test.describe('Fluxo de viagens (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('cria, inicia e finaliza uma viagem', async ({ page }) => {
    // ─── Pré-flight: precisa haver motorista + veículo ─────────────────────
    await page.getByRole('link', { name: 'Motoristas' }).click();
    await expect(page).toHaveURL(/\/motoristas/);
    const semMotorista = await page
      .getByText(/nenhum motorista|empty|sem registros/i)
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(semMotorista, 'Banco sem motorista — rode seed-motorista-teste.ts antes');

    // ─── 1. Criar viagem ───────────────────────────────────────────────────
    await page.getByRole('link', { name: 'Viagens' }).click();
    await expect(page).toHaveURL(/\/viagens/);

    // Acessa direto /viagens/nova (botão "Nova" pode ter rótulo variado)
    await page.goto('/viagens/nova');
    await expect(page.getByRole('heading', { name: /nova viagem/i })).toBeVisible();

    const data = dataFuturaISO(60);
    const { inicio, fim } = horaUnica();
    const destino = `E2E PLAYWRIGHT ${Date.now()}`;

    await page.getByLabel(/destino/i).fill(destino);
    await page.locator('input[type="date"]').first().fill(data);
    await page.locator('input[type="time"]').first().fill(inicio);
    await page.locator('input[type="time"]').nth(1).fill(fim);

    await selecionarPrimeiroDoSelect(page, 'motorista');
    await selecionarPrimeiroDoSelect(page, 'veículo|veiculo');

    await page.getByLabel(/solicitado por/i).fill('USUARIO E2E');
    await page.getByLabel(/autorizado por/i).fill('GESTOR E2E');

    await page.getByRole('button', { name: /criar viagem/i }).click();

    // Espera redirecionamento para /viagens (lista)
    await page.waitForURL(/\/viagens(\?|$)/, { timeout: 15_000 });
    await expect(page.getByText(destino).first()).toBeVisible({ timeout: 10_000 });

    // ─── 2. Iniciar viagem ─────────────────────────────────────────────────
    await page.getByText(destino).first().click();
    await page.waitForURL(/\/viagens\/[a-f0-9-]+/i);
    await expect(page.getByRole('heading', { name: /detalhe da viagem/i })).toBeVisible();

    await expect(page.getByText('Criada').first()).toBeVisible();

    // Botão de iniciar e campo de odômetro inicial
    const inputOdometroInicial = page.getByLabel(/odômetro inicial|odometro inicial/i);
    await inputOdometroInicial.waitFor({ state: 'visible' });
    const valorInicial = (await inputOdometroInicial.inputValue()) || '0';
    await page.getByRole('button', { name: /iniciar|confirmar início/i }).click();

    await expect(page.getByText('Em andamento').first()).toBeVisible({ timeout: 10_000 });

    // ─── 3. Finalizar viagem ───────────────────────────────────────────────
    const odoFinal = String(Number(valorInicial) + 50);
    const inputOdometroFinal = page.getByLabel(/odômetro final|odometro final/i);
    await inputOdometroFinal.waitFor({ state: 'visible' });
    await inputOdometroFinal.fill(odoFinal);
    await page.getByRole('button', { name: /finalizar|confirmar chegada/i }).click();

    await expect(page.getByText('Finalizada').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/distância percorrida/i)).toBeVisible();
  });

  test('validação: hora fim antes da hora início bloqueia submit', async ({ page }) => {
    await page.goto('/viagens/nova');
    await page.getByLabel(/destino/i).fill('VALIDACAO E2E');
    await page.locator('input[type="date"]').first().fill(dataFuturaISO(60));
    await page.locator('input[type="time"]').first().fill('10:00');
    await page.locator('input[type="time"]').nth(1).fill('09:00');
    await page.getByLabel(/solicitado por/i).fill('USUARIO E2E');
    await page.getByLabel(/autorizado por/i).fill('GESTOR E2E');

    await page.getByRole('button', { name: /criar viagem/i }).click();

    // O form deve permanecer em /viagens/nova (não navegou pra lista)
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/viagens\/nova/);
  });

  test('validação: data no passado é rejeitada', async ({ page }) => {
    await page.goto('/viagens/nova');
    const ontem = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    await page.getByLabel(/destino/i).fill('DATA PASSADA E2E');
    await page.locator('input[type="date"]').first().fill(ontem);
    await page.locator('input[type="time"]').first().fill('10:00');
    await page.locator('input[type="time"]').nth(1).fill('11:00');
    await page.getByLabel(/solicitado por/i).fill('USUARIO E2E');
    await page.getByLabel(/autorizado por/i).fill('GESTOR E2E');

    await page.getByRole('button', { name: /criar viagem/i }).click();

    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/viagens\/nova/);
  });
});
