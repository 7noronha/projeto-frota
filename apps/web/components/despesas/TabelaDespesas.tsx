'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge, Button, Alert, HStack } from '@lojascem/components-react';
import { acaoExcluirDespesa, type Despesa, type TipoDespesa } from '@/app/(dashboard)/veiculos/[id]/despesas/actions';
import { EstadoVazio } from '@/components/EstadoVazio';
import { DialogConfirmacao } from '@/components/DialogConfirmacao';
import { notificar } from '@/lib/notificar';
import { formatarDataIso } from '@fleetops/utils';

interface TabelaDespesasProps {
  veiculoId: string;
  despesas: Despesa[];
}

const CONFIG_TIPO: Record<
  TipoDespesa,
  { rotulo: string; color: 'info' | 'warning' | 'error' | 'success' | 'default' }
> = {
  abastecimento: { rotulo: 'Abastecimento', color: 'info' },
  manutencao: { rotulo: 'Manutenção', color: 'warning' },
  multa: { rotulo: 'Multa', color: 'error' },
  imposto: { rotulo: 'Imposto', color: 'default' },
  seguro: { rotulo: 'Seguro', color: 'info' },
  documentacao: { rotulo: 'Documentação', color: 'success' },
};

const ROTULO_IMPOSTO: Record<string, string> = {
  ipva: 'IPVA',
  licenciamento: 'Licenciamento',
  dpvat: 'DPVAT',
  outro: 'Outro',
};

const ROTULO_DOCUMENTO: Record<string, string> = {
  crlv: 'CRLV',
  transferencia: 'Transferência',
  vistoria: 'Vistoria',
  emplacamento: 'Emplacamento',
  outro: 'Outro',
};

function formatarMoeda(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string): string {
  return formatarDataIso(iso);
}

export function TabelaDespesas({ veiculoId, despesas }: TabelaDespesasProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<{ id: string; descricao: string } | null>(null);

  function abrirExclusao(id: string, descricao: string) {
    setErro(null);
    setDialog({ id, descricao });
  }

  function fecharDialog() {
    if (!isPending) setDialog(null);
  }

  function confirmarExclusao() {
    if (!dialog) return;
    const { id, descricao } = dialog;
    startTransition(async () => {
      const resultado = await acaoExcluirDespesa(veiculoId, id);
      if (resultado?.erro) {
        setErro(resultado.erro);
        notificar.erro(resultado.erro);
      } else {
        notificar.sucesso(`Despesa "${descricao}" excluída.`);
      }
      setDialog(null);
    });
  }

  function corpoTipo(row: Despesa) {
    const cfg = CONFIG_TIPO[row.tipo];
    return (
      <span className="inline-block whitespace-nowrap">
        <Badge color={cfg.color} variant="light">
          {cfg.rotulo}
        </Badge>
      </span>
    );
  }

  function corpoData(row: Despesa) {
    return <span className="text-sm">{formatarData(row.data)}</span>;
  }

  function corpoValor(row: Despesa) {
    return <span className="font-semibold text-sm">{formatarMoeda(row.valor)}</span>;
  }

  function corpoDescricao(row: Despesa) {
    const detalhes: string[] = [];
    if (row.tipo === 'abastecimento' && row.litros != null) {
      detalhes.push(`${row.litros.toLocaleString('pt-BR')}L`);
      if (row.tipoCombustivel) detalhes.push(row.tipoCombustivel);
    }
    if (row.tipo === 'manutencao' && row.tipoManutencao) {
      detalhes.push(row.tipoManutencao);
    }
    if (row.tipo === 'multa' && row.gravidade) {
      detalhes.push(`${row.gravidade}${row.pontosCnh ? ` · ${row.pontosCnh} pts` : ''}`);
    }
    if (row.tipo === 'imposto' && row.tipoImposto) {
      detalhes.push(ROTULO_IMPOSTO[row.tipoImposto] ?? row.tipoImposto);
      if (row.anoExercicio) detalhes.push(`${row.anoExercicio}`);
      if (row.numeroParcela && row.totalParcelas) {
        detalhes.push(`parc. ${row.numeroParcela}/${row.totalParcelas}`);
      }
    }
    if (row.tipo === 'seguro' && row.seguradora) {
      detalhes.push(row.seguradora);
      if (row.vigenciaFim) {
        detalhes.push(
          `até ${formatarDataIso(row.vigenciaFim)}`,
        );
      }
    }
    if (row.tipo === 'documentacao' && row.tipoDocumento) {
      detalhes.push(ROTULO_DOCUMENTO[row.tipoDocumento] ?? row.tipoDocumento);
    }
    return (
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium">{row.descricao}</span>
        {detalhes.length > 0 && (
          <span className="text-xs text-gray-500">{detalhes.join(' · ')}</span>
        )}
      </div>
    );
  }

  function corpoOdometro(row: Despesa) {
    return row.odometro != null ? (
      <span className="text-sm">{row.odometro.toLocaleString('pt-BR')} km</span>
    ) : (
      <span className="text-gray-400 text-xs">—</span>
    );
  }

  function corpoAcoes(row: Despesa) {
    return (
      <HStack alignItems="center" gap={2}>
        <Link
          href={`/veiculos/${veiculoId}/despesas/${row.id}/editar`}
          style={{ textDecoration: 'none' }}
        >
          <Button variant="light" color="primary" size="sm" leftIcon="PiPencilBold">
            Editar
          </Button>
        </Link>
        <Button
          variant="light"
          color="error"
          size="sm"
          leftIcon="PiTrashBold"
          aria-label={`Excluir despesa ${row.descricao}`}
          onPress={() => abrirExclusao(row.id, row.descricao)}
        >
          Excluir
        </Button>
      </HStack>
    );
  }

  return (
    <div>
      {erro && (
        <div role="alert" aria-live="polite" className="mb-4">
          <Alert color="error">{erro}</Alert>
        </div>
      )}

      <DataTable
        value={despesas}
        emptyMessage={
          <EstadoVazio
            icone="PiReceiptBold"
            titulo="Nenhuma despesa registrada"
            descricao="Cadastre a primeira despesa (abastecimento, manutenção ou multa) para esse veículo."
            cta={
              <Link
                href={`/veiculos/${veiculoId}/despesas/nova`}
                style={{ textDecoration: 'none' }}
              >
                <Button color="primary" size="sm" leftIcon="PiPlusBold">
                  Cadastrar despesa
                </Button>
              </Link>
            }
          />
        }
        stripedRows
        className="w-full tabela-compacta"
        style={{ borderRadius: 12, overflow: 'hidden' }}
      >
        <Column field="data" header="Data" body={corpoData} sortable />
        <Column field="tipo" header="Tipo" body={corpoTipo} sortable />
        <Column field="descricao" header="Descrição" body={corpoDescricao} sortable />
        <Column field="odometro" header="Odômetro" body={corpoOdometro} sortable />
        <Column field="valor" header="Valor" body={corpoValor} sortable />
        <Column header="Ações" body={corpoAcoes} style={{ width: 180 }} />
      </DataTable>

      <DialogConfirmacao
        visivel={dialog !== null}
        titulo="Excluir despesa"
        descricao={`A despesa "${dialog?.descricao ?? ''}" será removida permanentemente.`}
        palavraConfirmacao={dialog?.descricao ?? ''}
        labelConfirmar="Excluir despesa"
        onConfirmar={confirmarExclusao}
        onCancelar={fecharDialog}
        carregando={isPending}
      />
    </div>
  );
}
