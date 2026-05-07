'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
// TODO: sem equivalente — DataTable e Column não têm par em @minha-empresa/components-react
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge, Button, Alert } from '@minha-empresa/components-react';
import { acaoExcluirVeiculo } from '@/app/(dashboard)/veiculos/actions';
import { EstadoVazio } from '@/components/EstadoVazio';
import { DialogConfirmacao } from '@/components/DialogConfirmacao';
import type { VeiculoResposta } from '@fleetops/types';

type BadgeColor = 'success' | 'warning' | 'default' | 'error';

const situacaoConfig: Record<string, { color: BadgeColor; rotulo: string }> = {
  ativo: { color: 'success', rotulo: 'Ativo' },
  em_manutencao: { color: 'warning', rotulo: 'Em manutenção' },
  inativo: { color: 'default', rotulo: 'Inativo' },
  baixado: { color: 'error', rotulo: 'Baixado' },
};

interface TabelaVeiculosProps {
  veiculos: VeiculoResposta[];
}

export function TabelaVeiculos({ veiculos }: TabelaVeiculosProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [veiculoParaExcluir, setVeiculoParaExcluir] = useState<{
    id: string;
    placa: string;
  } | null>(null);

  function abrirDialogExclusao(id: string, placa: string) {
    setErro(null);
    setVeiculoParaExcluir({ id, placa });
  }

  function fecharDialog() {
    if (!isPending) setVeiculoParaExcluir(null);
  }

  function confirmarExclusao() {
    if (!veiculoParaExcluir) return;
    startTransition(async () => {
      const resultado = await acaoExcluirVeiculo(veiculoParaExcluir.id);
      if (resultado?.erro) {
        setErro(resultado.erro);
      }
      setVeiculoParaExcluir(null);
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
    const cfg = situacaoConfig[rowData.situacao] ?? { color: 'default' as BadgeColor, rotulo: rowData.situacao };
    return <Badge color={cfg.color} variant="light">{cfg.rotulo}</Badge>;
  }

  function corpoAcoes(rowData: VeiculoResposta) {
    return (
      <div className="flex items-center gap-2">
        <Link href={`/veiculos/${rowData.id}/editar`} style={{ textDecoration: 'none' }}>
          <Button variant="ghost" color="primary" size="sm" leftIcon="PiPencilBold">
            Editar
          </Button>
        </Link>
        <Button
          variant="ghost"
          color="error"
          size="sm"
          leftIcon="PiTrashBold"
          aria-label={`Excluir veículo ${rowData.placa}`}
          onClick={() => abrirDialogExclusao(rowData.id, rowData.placa)}
        >
          Excluir
        </Button>
      </div>
    );
  }

  return (
    <div>
      {erro && (
        <Alert color="error" className="mb-4">{erro}</Alert>
      )}

      <DataTable
        value={veiculos}
        emptyMessage={
          <EstadoVazio
            icone="PiCarBold"
            titulo="Nenhum veículo cadastrado"
            descricao="Os veículos da frota aparecerão aqui. Cadastre o primeiro para começar."
            cta={
              <Link href="/veiculos/novo" style={{ textDecoration: 'none' }}>
                <Button color="primary" size="sm" leftIcon="PiPlusBold">Cadastrar veículo</Button>
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

      <DialogConfirmacao
        visivel={veiculoParaExcluir !== null}
        titulo="Excluir veículo"
        descricao={`Esta ação é irreversível. O veículo ${veiculoParaExcluir?.placa ?? ''} e todos os seus dados serão removidos permanentemente.`}
        palavraConfirmacao={veiculoParaExcluir?.placa ?? ''}
        labelConfirmar="Excluir veículo"
        onConfirmar={confirmarExclusao}
        onCancelar={fecharDialog}
        carregando={isPending}
      />
    </div>
  );
}
