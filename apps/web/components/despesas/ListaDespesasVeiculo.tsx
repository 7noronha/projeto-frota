'use client';

import { useState } from 'react';
import {
  Button,
  Heading,
  HStack,
  Text,
  VStack,
} from '@lojascem/components-react';
import type {
  MultaResposta,
  AbastecimentoResposta,
  ManutencaoResposta,
  ImpostoResposta,
  SeguroResposta,
  DocumentacaoResposta,
} from '@fleetops/types';
import { formatarDataIso } from '@fleetops/utils';

type AbaDespesa =
  | 'multas'
  | 'abastecimentos'
  | 'manutencoes'
  | 'impostos'
  | 'seguros'
  | 'documentacoes';

interface ListaDespesasVeiculoProps {
  multas: MultaResposta[];
  abastecimentos: AbastecimentoResposta[];
  manutencoes: ManutencaoResposta[];
  impostos: ImpostoResposta[];
  seguros: SeguroResposta[];
  documentacoes: DocumentacaoResposta[];
}

const ABAS: { id: AbaDespesa; rotulo: string }[] = [
  { id: 'multas', rotulo: 'Multas' },
  { id: 'abastecimentos', rotulo: 'Abastecimentos' },
  { id: 'manutencoes', rotulo: 'Manutenções' },
  { id: 'impostos', rotulo: 'Impostos' },
  { id: 'seguros', rotulo: 'Seguros' },
  { id: 'documentacoes', rotulo: 'Documentações' },
];

function brl(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ListaDespesasVeiculo(props: ListaDespesasVeiculoProps) {
  const [aba, setAba] = useState<AbaDespesa>('multas');

  const contagens: Record<AbaDespesa, number> = {
    multas: props.multas.length,
    abastecimentos: props.abastecimentos.length,
    manutencoes: props.manutencoes.length,
    impostos: props.impostos.length,
    seguros: props.seguros.length,
    documentacoes: props.documentacoes.length,
  };

  const totais: Record<AbaDespesa, number> = {
    multas: props.multas.reduce((s, m) => s + m.valor, 0),
    abastecimentos: props.abastecimentos.reduce((s, a) => s + a.valor, 0),
    manutencoes: props.manutencoes.reduce((s, m) => s + m.valor, 0),
    impostos: props.impostos.reduce((s, i) => s + i.valor, 0),
    seguros: props.seguros.reduce((s, sg) => s + sg.valor, 0),
    documentacoes: props.documentacoes.reduce((s, d) => s + d.valor, 0),
  };

  return (
    <VStack className="gap-4">
      {/* Tabs */}
      <HStack
        alignItems="center"
        gap={2}
        style={{ flexWrap: 'wrap', borderBottom: '1px solid var(--fo-border)', paddingBottom: 8 }}
      >
        {ABAS.map((a) => (
          <Button
            key={a.id}
            size="sm"
            variant={aba === a.id ? 'solid' : 'light'}
            color={aba === a.id ? 'primary' : 'default'}
            onPress={() => setAba(a.id)}
          >
            {a.rotulo} ({contagens[a.id]})
          </Button>
        ))}
      </HStack>

      <HStack alignItems="center" justifyContent="between">
        <Heading size="md">{ABAS.find((a) => a.id === aba)?.rotulo}</Heading>
        <Text size="sm" style={{ color: 'var(--fo-text-secondary)' }}>
          Total: <span className="font-semibold">{brl(totais[aba])}</span>
        </Text>
      </HStack>

      {aba === 'multas' && <TabelaMultas itens={props.multas} />}
      {aba === 'abastecimentos' && <TabelaAbastecimentos itens={props.abastecimentos} />}
      {aba === 'manutencoes' && <TabelaManutencoes itens={props.manutencoes} />}
      {aba === 'impostos' && <TabelaImpostos itens={props.impostos} />}
      {aba === 'seguros' && <TabelaSeguros itens={props.seguros} />}
      {aba === 'documentacoes' && <TabelaDocumentacoes itens={props.documentacoes} />}
    </VStack>
  );
}

function Vazio({ tipo }: { tipo: string }) {
  return (
    <Text size="sm" style={{ color: 'var(--fo-text-secondary)', padding: 24, textAlign: 'center' }}>
      Nenhum lançamento de {tipo} para este veículo.
    </Text>
  );
}

function Linha({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: '10px 12px',
        borderBottom: '1px solid var(--fo-border)',
        fontSize: 14,
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}

function Cabecalho({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: '8px 12px',
        backgroundColor: 'var(--fo-bg-secondary)',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--fo-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {children}
    </div>
  );
}

function TabelaMultas({ itens }: { itens: MultaResposta[] }) {
  if (itens.length === 0) return <Vazio tipo="multas" />;
  return (
    <div style={{ border: '1px solid var(--fo-border)', borderRadius: 8, overflow: 'hidden' }}>
      <Cabecalho>
        <div style={{ flex: 2 }}>Data</div>
        <div style={{ flex: 1 }}>Gravidade</div>
        <div style={{ flex: 3 }}>Descrição</div>
        <div style={{ flex: 1, textAlign: 'right' }}>Valor</div>
        <div style={{ flex: 1 }}>Vencimento</div>
      </Cabecalho>
      {itens.map((m) => (
        <Linha key={m.id}>
          <div style={{ flex: 2 }}>{formatarDataIso(m.data)}</div>
          <div style={{ flex: 1 }}>{m.gravidade.nome}</div>
          <div style={{ flex: 3 }}>{m.descricao}</div>
          <div style={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>{brl(m.valor)}</div>
          <div style={{ flex: 1 }}>{m.data_vencimento ? formatarDataIso(m.data_vencimento) : '—'}</div>
        </Linha>
      ))}
    </div>
  );
}

function TabelaAbastecimentos({ itens }: { itens: AbastecimentoResposta[] }) {
  if (itens.length === 0) return <Vazio tipo="abastecimentos" />;
  return (
    <div style={{ border: '1px solid var(--fo-border)', borderRadius: 8, overflow: 'hidden' }}>
      <Cabecalho>
        <div style={{ flex: 2 }}>Data</div>
        <div style={{ flex: 1 }}>Combustível</div>
        <div style={{ flex: 1, textAlign: 'right' }}>Litros</div>
        <div style={{ flex: 1, textAlign: 'right' }}>R$/L</div>
        <div style={{ flex: 1, textAlign: 'right' }}>Total</div>
        <div style={{ flex: 1, textAlign: 'right' }}>Odômetro</div>
      </Cabecalho>
      {itens.map((a) => (
        <Linha key={a.id}>
          <div style={{ flex: 2 }}>{formatarDataIso(a.data)}</div>
          <div style={{ flex: 1 }}>{a.tipo_combustivel.nome}</div>
          <div style={{ flex: 1, textAlign: 'right' }}>{a.litros.toFixed(2)}</div>
          <div style={{ flex: 1, textAlign: 'right' }}>{brl(a.preco_litro)}</div>
          <div style={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>{brl(a.valor)}</div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            {a.odometro != null ? a.odometro.toLocaleString('pt-BR') : '—'}
          </div>
        </Linha>
      ))}
    </div>
  );
}

function TabelaManutencoes({ itens }: { itens: ManutencaoResposta[] }) {
  if (itens.length === 0) return <Vazio tipo="manutenções" />;
  return (
    <div style={{ border: '1px solid var(--fo-border)', borderRadius: 8, overflow: 'hidden' }}>
      <Cabecalho>
        <div style={{ flex: 2 }}>Data</div>
        <div style={{ flex: 1 }}>Tipo</div>
        <div style={{ flex: 2 }}>Descrição</div>
        <div style={{ flex: 1 }}>Oficina</div>
        <div style={{ flex: 1, textAlign: 'right' }}>Odômetro</div>
        <div style={{ flex: 1, textAlign: 'right' }}>Valor</div>
      </Cabecalho>
      {itens.map((m) => (
        <Linha key={m.id}>
          <div style={{ flex: 2 }}>{formatarDataIso(m.data)}</div>
          <div style={{ flex: 1 }}>{m.tipo_manutencao.nome}</div>
          <div style={{ flex: 2 }}>{m.descricao}</div>
          <div style={{ flex: 1 }}>{m.oficina ?? '—'}</div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            {m.odometro != null ? m.odometro.toLocaleString('pt-BR') : '—'}
          </div>
          <div style={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>{brl(m.valor)}</div>
        </Linha>
      ))}
    </div>
  );
}

function TabelaImpostos({ itens }: { itens: ImpostoResposta[] }) {
  if (itens.length === 0) return <Vazio tipo="impostos" />;
  return (
    <div style={{ border: '1px solid var(--fo-border)', borderRadius: 8, overflow: 'hidden' }}>
      <Cabecalho>
        <div style={{ flex: 1 }}>Exercício</div>
        <div style={{ flex: 1 }}>Tipo</div>
        <div style={{ flex: 2 }}>Descrição</div>
        <div style={{ flex: 1 }}>Parcela</div>
        <div style={{ flex: 1 }}>Vencimento</div>
        <div style={{ flex: 1, textAlign: 'right' }}>Valor</div>
      </Cabecalho>
      {itens.map((i) => (
        <Linha key={i.id}>
          <div style={{ flex: 1 }}>{i.ano_exercicio}</div>
          <div style={{ flex: 1 }}>{i.tipo_imposto.nome}</div>
          <div style={{ flex: 2 }}>{i.descricao}</div>
          <div style={{ flex: 1 }}>
            {i.numero_parcela && i.total_parcelas
              ? `${i.numero_parcela}/${i.total_parcelas}`
              : '—'}
          </div>
          <div style={{ flex: 1 }}>{i.data_vencimento ? formatarDataIso(i.data_vencimento) : '—'}</div>
          <div style={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>{brl(i.valor)}</div>
        </Linha>
      ))}
    </div>
  );
}

function TabelaSeguros({ itens }: { itens: SeguroResposta[] }) {
  if (itens.length === 0) return <Vazio tipo="seguros" />;
  return (
    <div style={{ border: '1px solid var(--fo-border)', borderRadius: 8, overflow: 'hidden' }}>
      <Cabecalho>
        <div style={{ flex: 1 }}>Cobertura</div>
        <div style={{ flex: 2 }}>Seguradora</div>
        <div style={{ flex: 1 }}>Apólice</div>
        <div style={{ flex: 1 }}>Início</div>
        <div style={{ flex: 1 }}>Fim</div>
        <div style={{ flex: 1, textAlign: 'right' }}>Valor</div>
      </Cabecalho>
      {itens.map((s) => (
        <Linha key={s.id}>
          <div style={{ flex: 1 }}>{s.tipo_cobertura.nome}</div>
          <div style={{ flex: 2 }}>{s.seguradora}</div>
          <div style={{ flex: 1 }}>{s.numero_apolice ?? '—'}</div>
          <div style={{ flex: 1 }}>{formatarDataIso(s.vigencia_inicio)}</div>
          <div style={{ flex: 1 }}>{formatarDataIso(s.vigencia_fim)}</div>
          <div style={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>{brl(s.valor)}</div>
        </Linha>
      ))}
    </div>
  );
}

function TabelaDocumentacoes({ itens }: { itens: DocumentacaoResposta[] }) {
  if (itens.length === 0) return <Vazio tipo="documentações" />;
  return (
    <div style={{ border: '1px solid var(--fo-border)', borderRadius: 8, overflow: 'hidden' }}>
      <Cabecalho>
        <div style={{ flex: 1 }}>Tipo</div>
        <div style={{ flex: 3 }}>Descrição</div>
        <div style={{ flex: 1 }}>Emissão</div>
        <div style={{ flex: 1 }}>Vencimento</div>
        <div style={{ flex: 1, textAlign: 'right' }}>Valor</div>
      </Cabecalho>
      {itens.map((d) => (
        <Linha key={d.id}>
          <div style={{ flex: 1 }}>{d.tipo_documento.nome}</div>
          <div style={{ flex: 3 }}>{d.descricao}</div>
          <div style={{ flex: 1 }}>{formatarDataIso(d.data)}</div>
          <div style={{ flex: 1 }}>{d.data_vencimento ? formatarDataIso(d.data_vencimento) : '—'}</div>
          <div style={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>{brl(d.valor)}</div>
        </Linha>
      ))}
    </div>
  );
}
