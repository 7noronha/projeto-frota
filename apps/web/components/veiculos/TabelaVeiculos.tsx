'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { acaoExcluirVeiculo } from '@/app/(dashboard)/veiculos/actions';
import { EstadoVazio } from '@/components/EstadoVazio';
import type { VeiculoResposta } from '@fleetops/types';

type SeveridadeTag = 'success' | 'warning' | 'danger' | 'info' | undefined;

const situacaoConfig: Record<string, { severity: SeveridadeTag; rotulo: string }> = {
  ativo: { severity: 'success', rotulo: 'Ativo' },
  em_manutencao: { severity: 'warning', rotulo: 'Em manutenção' },
  inativo: { severity: undefined, rotulo: 'Inativo' },
  baixado: { severity: 'danger', rotulo: 'Baixado' },
};

interface TabelaVeiculosProps {
  veiculos: VeiculoResposta[];
}

export function TabelaVeiculos({ veiculos }: TabelaVeiculosProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmarExclusao(id: string, placa: string) {
    if (!confirm(`Tem certeza que deseja excluir o veículo ${placa}?`)) return;
    startTransition(async () => {
      const resultado = await acaoExcluirVeiculo(id);
      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  function corpoPlaca(rowData: VeiculoResposta) {
    return <span className="font-mono font-semibold">{rowData.placa}</span>;
  }

  function corpoMarcaModelo(rowData: VeiculoResposta) {
    return `${rowData.marca} ${rowData.modelo}`;
  }

  function corpoAno(rowData: VeiculoResposta) {
    return `${rowData.anoFabricacao}/${rowData.anoModelo}`;
  }

  function corpoOdometro(rowData: VeiculoResposta) {
    return `${rowData.odometroAtual.toLocaleString('pt-BR')} km`;
  }

  function corpoSituacao(rowData: VeiculoResposta) {
    const cfg = situacaoConfig[rowData.situacao] ?? { severity: undefined, rotulo: rowData.situacao };
    return <Tag value={cfg.rotulo} severity={cfg.severity} />;
  }

  function corpoAcoes(rowData: VeiculoResposta) {
    return (
      <div className="flex items-center gap-2">
        <Link href={`/veiculos/${rowData.id}/editar`} style={{ textDecoration: 'none' }}>
          <Button
            label="Editar"
            icon="pi pi-pencil"
            size="small"
            text
            style={{ color: '#0066FF', padding: '0.25rem 0.5rem' }}
          />
        </Link>
        <Button
          label="Excluir"
          icon="pi pi-trash"
          size="small"
          text
          severity="danger"
          loading={isPending}
          onClick={() => confirmarExclusao(rowData.id, rowData.placa)}
          style={{ padding: '0.25rem 0.5rem' }}
        />
      </div>
    );
  }

  return (
    <div>
      {erro && (
        <Message severity="error" text={erro} className="w-full justify-start mb-4" />
      )}
      <DataTable
        value={veiculos}
        emptyMessage={
          <EstadoVazio
            icone="pi pi-car"
            titulo="Nenhum veículo cadastrado"
            descricao="Os veículos da frota aparecerão aqui. Cadastre o primeiro para começar."
            cta={
              <Link href="/veiculos/novo" style={{ textDecoration: 'none' }}>
                <Button label="Cadastrar veículo" icon="pi pi-plus" size="small" />
              </Link>
            }
          />
        }
        stripedRows
        className="w-full"
        style={{ borderRadius: 12, overflow: 'hidden' }}
      >
        <Column field="placa" header="Placa" body={corpoPlaca} />
        <Column header="Marca / Modelo" body={corpoMarcaModelo} />
        <Column header="Ano" body={corpoAno} />
        <Column field="cor" header="Cor" />
        <Column header="Odômetro" body={corpoOdometro} />
        <Column field="situacao" header="Situação" body={corpoSituacao} />
        <Column header="Ações" body={corpoAcoes} style={{ width: 180 }} />
      </DataTable>
    </div>
  );
}
