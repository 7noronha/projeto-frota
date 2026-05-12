import { HStack, VStack, Text, Icon } from '@lojascem/components-react';
import type { Despesa, TipoDespesa } from '@/app/(dashboard)/veiculos/[id]/despesas/actions';

interface ResumoDespesasProps {
  despesas: Despesa[];
}

const CONFIG: Record<
  TipoDespesa,
  {
    rotulo: string;
    icone: 'PiGasPumpBold' | 'PiWrenchBold' | 'PiWarningOctagonBold';
    cor: string;
  }
> = {
  abastecimento: { rotulo: 'Abastecimento', icone: 'PiGasPumpBold', cor: '#0066FF' },
  manutencao: { rotulo: 'Manutenção', icone: 'PiWrenchBold', cor: '#D97706' },
  multa: { rotulo: 'Multas', icone: 'PiWarningOctagonBold', cor: '#DC2626' },
};

function formatarMoeda(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ResumoDespesas({ despesas }: ResumoDespesasProps): React.ReactElement {
  const totais: Record<TipoDespesa, { total: number; qtd: number }> = {
    abastecimento: { total: 0, qtd: 0 },
    manutencao: { total: 0, qtd: 0 },
    multa: { total: 0, qtd: 0 },
  };

  let totalGeral = 0;
  for (const d of despesas) {
    totais[d.tipo].total += d.valor;
    totais[d.tipo].qtd += 1;
    totalGeral += d.valor;
  }

  const tipos: TipoDespesa[] = ['abastecimento', 'manutencao', 'multa'];

  return (
    <VStack className="gap-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Total geral */}
        <div
          className="rounded-xl border bg-white p-4"
          style={{ borderColor: '#e2e8f0' }}
        >
          <Text size="xs" className="font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
            Total geral
          </Text>
          <Text size="xl" className="font-bold mt-1" style={{ color: '#0f172a' }}>
            {formatarMoeda(totalGeral)}
          </Text>
          <Text size="xs" style={{ color: '#64748b' }}>
            {despesas.length} {despesas.length === 1 ? 'despesa' : 'despesas'}
          </Text>
        </div>

        {tipos.map((t) => {
          const cfg = CONFIG[t];
          const dados = totais[t];
          return (
            <div
              key={t}
              className="rounded-xl border bg-white p-4"
              style={{ borderColor: '#e2e8f0' }}
            >
              <HStack alignItems="center" className="gap-2">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    background: `${cfg.cor}15`,
                    color: cfg.cor,
                    width: 32,
                    height: 32,
                  }}
                >
                  <Icon name={cfg.icone} size="sm" color="default" />
                </div>
                <Text size="xs" className="font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                  {cfg.rotulo}
                </Text>
              </HStack>
              <Text size="lg" className="font-bold mt-2" style={{ color: '#0f172a' }}>
                {formatarMoeda(dados.total)}
              </Text>
              <Text size="xs" style={{ color: '#64748b' }}>
                {dados.qtd} {dados.qtd === 1 ? 'lançamento' : 'lançamentos'}
              </Text>
            </div>
          );
        })}
      </div>
    </VStack>
  );
}
