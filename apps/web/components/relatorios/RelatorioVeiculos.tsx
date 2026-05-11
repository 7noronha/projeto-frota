'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button, Card, HStack, Heading, Text } from '@lojascem/components-react';
import { exportarCsv } from '@/lib/exportar-csv';
import { EstadoVazio } from '@/components/EstadoVazio';
import type { AgregadoVeiculo } from '@/app/(dashboard)/relatorios/actions';

interface RelatorioVeiculosProps {
  dados: AgregadoVeiculo[];
}

export function RelatorioVeiculos({ dados }: RelatorioVeiculosProps) {
  const totalKm = dados.reduce((s, d) => s + d.totalKm, 0);
  const totalViagens = dados.reduce((s, d) => s + d.totalViagens, 0);

  function exportar() {
    exportarCsv('distancia-por-veiculo.csv', dados, [
      { cabecalho: 'Placa', valor: (d) => d.placa },
      { cabecalho: 'Marca', valor: (d) => d.marca },
      { cabecalho: 'Modelo', valor: (d) => d.modelo },
      { cabecalho: 'Total viagens', valor: (d) => String(d.totalViagens) },
      { cabecalho: 'Total km', valor: (d) => String(d.totalKm) },
    ]);
  }

  return (
    <Card>
      <Card.Content>
        <HStack alignItems="center" justifyContent="between" className="mb-4">
          <div>
            <Heading size="md" weight="semibold" style={{ color: 'var(--fo-navy)' }}>
              Distância por veículo
            </Heading>
            <Text size="xs" style={{ color: '#64748b' }}>
              Apenas viagens FINALIZADAS · Total geral:{' '}
              <strong>{totalViagens}</strong> viagens · <strong>{totalKm.toLocaleString('pt-BR')}</strong> km
            </Text>
          </div>
          <Button
            variant="outline"
            color="default"
            size="sm"
            leftIcon="PiFileCsvBold"
            onPress={exportar}
            isDisabled={dados.length === 0}
          >
            Exportar CSV
          </Button>
        </HStack>

        {dados.length === 0 ? (
          <EstadoVazio
            icone="PiCarBold"
            titulo="Nenhuma viagem finalizada no período"
            descricao="Ajuste o intervalo de datas para ver os dados."
          />
        ) : (
          <DataTable
            value={dados}
            stripedRows
            className="w-full"
            style={{ borderRadius: 8, overflow: 'hidden' }}
          >
            <Column field="placa" header="Placa" sortable
              body={(r: AgregadoVeiculo) => (
                <span className="font-mono text-sm font-semibold">{r.placa}</span>
              )} />
            <Column header="Marca / Modelo" sortable
              field="modelo"
              body={(r: AgregadoVeiculo) => `${r.marca} ${r.modelo}`} />
            <Column
              field="totalViagens"
              header="Viagens"
              sortable
              body={(r: AgregadoVeiculo) => r.totalViagens.toLocaleString('pt-BR')}
            />
            <Column
              field="totalKm"
              header="Km percorrido"
              sortable
              body={(r: AgregadoVeiculo) => (
                <span className="font-semibold">{r.totalKm.toLocaleString('pt-BR')} km</span>
              )}
            />
          </DataTable>
        )}
      </Card.Content>
    </Card>
  );
}
