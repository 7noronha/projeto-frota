import { HStack, VStack, Text, Icon } from '@lojascem/components-react';
import type { Despesa, TipoDespesa } from '@/app/(dashboard)/veiculos/[id]/despesas/actions';

interface ResumoDespesasProps {
  despesas: Despesa[];
}

type IconeTipo =
  | 'PiGasPumpBold'
  | 'PiWrenchBold'
  | 'PiWarningOctagonBold'
  | 'PiReceiptBold'
  | 'PiShieldCheckBold'
  | 'PiFileTextBold';

const CONFIG: Record<TipoDespesa, { rotulo: string; icone: IconeTipo; cor: string }> = {
  abastecimento: { rotulo: 'Abastecimento', icone: 'PiGasPumpBold', cor: '#0066FF' },
  manutencao: { rotulo: 'Manutenção', icone: 'PiWrenchBold', cor: '#D97706' },
  multa: { rotulo: 'Multas', icone: 'PiWarningOctagonBold', cor: '#DC2626' },
  imposto: { rotulo: 'Impostos', icone: 'PiReceiptBold', cor: '#9333EA' },
  seguro: { rotulo: 'Seguro', icone: 'PiShieldCheckBold', cor: '#2563EB' },
  documentacao: { rotulo: 'Documentação', icone: 'PiFileTextBold', cor: '#10B981' },
};

function formatarMoeda(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const TIPOS_ORDENADOS: TipoDespesa[] = [
  'abastecimento',
  'manutencao',
  'multa',
  'imposto',
  'seguro',
  'documentacao',
];

export function ResumoDespesas({ despesas }: ResumoDespesasProps): React.ReactElement {
  const totais: Record<TipoDespesa, { total: number; qtd: number }> = {
    abastecimento: { total: 0, qtd: 0 },
    manutencao: { total: 0, qtd: 0 },
    multa: { total: 0, qtd: 0 },
    imposto: { total: 0, qtd: 0 },
    seguro: { total: 0, qtd: 0 },
    documentacao: { total: 0, qtd: 0 },
  };

  let totalGeral = 0;
  for (const d of despesas) {
    totais[d.tipo].total += d.valor;
    totais[d.tipo].qtd += 1;
    totalGeral += d.valor;
  }

  return (
    <VStack className="gap-3">
      {/* Card de total geral em destaque */}
      <div
        className="rounded-xl border bg-white p-4"
        style={{ borderColor: '#e2e8f0', borderLeft: '4px solid #0A2540' }}
      >
        <HStack alignItems="center" justifyContent="between">
          <VStack className="gap-0.5">
            <Text
              size="xs"
              className="font-semibold uppercase tracking-wide"
              style={{ color: '#94a3b8' }}
            >
              Total geral
            </Text>
            <Text size="2xl" className="font-bold" style={{ color: '#0f172a' }}>
              {formatarMoeda(totalGeral)}
            </Text>
          </VStack>
          <Text size="sm" style={{ color: '#64748b' }}>
            {despesas.length} {despesas.length === 1 ? 'lançamento' : 'lançamentos'}
          </Text>
        </HStack>
      </div>

      {/* Grid com os 6 tipos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TIPOS_ORDENADOS.map((t) => {
          const cfg = CONFIG[t];
          const dados = totais[t];
          const percentual = totalGeral > 0 ? (dados.total / totalGeral) * 100 : 0;
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
                <Text
                  size="xs"
                  className="font-semibold uppercase tracking-wide"
                  style={{ color: '#94a3b8' }}
                >
                  {cfg.rotulo}
                </Text>
              </HStack>
              <Text size="lg" className="font-bold mt-2" style={{ color: '#0f172a' }}>
                {formatarMoeda(dados.total)}
              </Text>
              <HStack alignItems="center" justifyContent="between" className="mt-0.5">
                <Text size="xs" style={{ color: '#64748b' }}>
                  {dados.qtd} {dados.qtd === 1 ? 'lançamento' : 'lançamentos'}
                </Text>
                {dados.total > 0 && (
                  <Text size="xs" className="font-medium" style={{ color: cfg.cor }}>
                    {percentual.toFixed(1)}%
                  </Text>
                )}
              </HStack>
            </div>
          );
        })}
      </div>
    </VStack>
  );
}
