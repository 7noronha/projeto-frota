'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
// TODO: sem equivalente — DataTable e Column não têm par em @minha-empresa/components-react
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge, Button } from '@minha-empresa/components-react';
import { EstadoVazio } from '@/components/EstadoVazio';
import { EstadoVazioFiltro } from '@/components/EstadoVazioFiltro';
import type { ViagemDetalhada } from '@fleetops/types';

type BadgeColor = 'info' | 'warning' | 'success' | 'default';

const statusConfig: Record<string, { color: BadgeColor; rotulo: string }> = {
  CRIADA: { color: 'info', rotulo: 'Criada' },
  EM_ANDAMENTO: { color: 'warning', rotulo: 'Em andamento' },
  FINALIZADA: { color: 'success', rotulo: 'Finalizada' },
};

interface TabelaViagensProps {
  viagens: ViagemDetalhada[];
  temFiltrosAtivos?: boolean;
}

export function TabelaViagens({ viagens, temFiltrosAtivos = false }: TabelaViagensProps) {
  const router = useRouter();

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
    const cfg = statusConfig[rowData.status] ?? { color: 'default' as BadgeColor, rotulo: rowData.status };
    return <Badge color={cfg.color} variant="light">{cfg.rotulo}</Badge>;
  }

  function corpoAcoes(rowData: ViagemDetalhada) {
    return (
      <Link href={`/viagens/${rowData.id}`} style={{ textDecoration: 'none' }}>
        <Button variant="ghost" color="primary" size="sm">Ver detalhes</Button>
      </Link>
    );
  }

  const emptyMessage = temFiltrosAtivos ? (
    <EstadoVazioFiltro onLimpar={() => router.push('/viagens')} />
  ) : (
    <EstadoVazio
      icone="pi pi-map"
      titulo="Nenhuma viagem ainda"
      descricao="As viagens criadas aparecerão aqui. Crie a primeira para começar."
      cta={
        <Link href="/viagens/nova" style={{ textDecoration: 'none' }}>
          <Button color="primary" size="sm" leftIcon="PiPlusBold">Nova viagem</Button>
        </Link>
      }
    />
  );

  return (
    <DataTable
      value={viagens}
      emptyMessage={emptyMessage}
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
