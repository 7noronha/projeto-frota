'use client';

import Link from 'next/link';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import type { ViagemDetalhada } from '@fleetops/types';

type SeveridadeTag = 'info' | 'warning' | 'success' | 'danger' | undefined;

const statusConfig: Record<string, { severity: SeveridadeTag; rotulo: string }> = {
  CRIADA: { severity: 'info', rotulo: 'Criada' },
  EM_ANDAMENTO: { severity: 'warning', rotulo: 'Em andamento' },
  FINALIZADA: { severity: 'success', rotulo: 'Finalizada' },
};

interface TabelaViagensProps {
  viagens: ViagemDetalhada[];
}

export function TabelaViagens({ viagens }: TabelaViagensProps) {
  function corpoData(rowData: ViagemDetalhada) {
    return new Date(rowData.dataViagem + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  function corpoMotorista(rowData: ViagemDetalhada) {
    return rowData.motorista.nome;
  }

  function corpoVeiculo(rowData: ViagemDetalhada) {
    return <span className="font-mono">{rowData.veiculo.placa}</span>;
  }

  function corpoHorario(rowData: ViagemDetalhada) {
    return `${rowData.horaInicioPrevista} – ${rowData.horaFimPrevista}`;
  }

  function corpoStatus(rowData: ViagemDetalhada) {
    const cfg = statusConfig[rowData.status] ?? { severity: undefined, rotulo: rowData.status };
    return <Tag value={cfg.rotulo} severity={cfg.severity} />;
  }

  function corpoAcoes(rowData: ViagemDetalhada) {
    return (
      <Link href={`/viagens/${rowData.id}`} style={{ textDecoration: 'none' }}>
        <Button label="Ver detalhes" size="small" text className="p-0" style={{ color: '#0066FF' }} />
      </Link>
    );
  }

  return (
    <DataTable
      value={viagens}
      emptyMessage={
        <div className="text-center py-8">
          <p style={{ color: '#64748b' }}>Nenhuma viagem encontrada.</p>
          <Link href="/viagens/nova" style={{ color: '#0066FF', fontSize: '0.875rem' }}>
            Criar primeira viagem
          </Link>
        </div>
      }
      stripedRows
      className="w-full"
      style={{ borderRadius: 12, overflow: 'hidden' }}
    >
      <Column field="dataViagem" header="Data" body={corpoData} />
      <Column field="destino" header="Destino" style={{ maxWidth: 200 }} />
      <Column field="motorista" header="Motorista" body={corpoMotorista} />
      <Column field="veiculo" header="Veículo" body={corpoVeiculo} />
      <Column header="Horário previsto" body={corpoHorario} />
      <Column field="status" header="Status" body={corpoStatus} />
      <Column header="Ações" body={corpoAcoes} style={{ width: 120 }} />
    </DataTable>
  );
}
