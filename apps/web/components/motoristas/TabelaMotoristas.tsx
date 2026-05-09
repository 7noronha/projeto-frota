'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge, Button, Alert, HStack } from '@lojascem/components-react';
import { acaoInativarMotorista, acaoReativarMotorista, acaoExcluirMotorista } from '@/app/(dashboard)/motoristas/actions';
import { EstadoVazio } from '@/components/EstadoVazio';
import { DialogConfirmacao } from '@/components/DialogConfirmacao';
import type { UsuarioResposta } from '@fleetops/types';

interface TabelaMotoristasProps {
  motoristas: UsuarioResposta[];
}

export function TabelaMotoristas({ motoristas }: TabelaMotoristasProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  type DialogTipo = 'inativar' | 'excluir';
  const [dialog, setDialog] = useState<{ id: string; nome: string; tipo: DialogTipo } | null>(null);

  function abrirDialog(id: string, nome: string, tipo: DialogTipo) {
    setErro(null);
    setDialog({ id, nome, tipo });
  }

  function fecharDialog() {
    if (!isPending) setDialog(null);
  }

  function confirmarAcao() {
    if (!dialog) return;
    startTransition(async () => {
      const acao = dialog.tipo === 'inativar'
        ? acaoInativarMotorista(dialog.id)
        : acaoExcluirMotorista(dialog.id);
      const resultado = await acao;
      if (resultado?.erro) setErro(resultado.erro);
      setDialog(null);
    });
  }

  function reativar(id: string) {
    setErro(null);
    startTransition(async () => {
      const resultado = await acaoReativarMotorista(id);
      if (resultado?.erro) setErro(resultado.erro ?? null);
    });
  }

  function corpoMatricula(row: UsuarioResposta) {
    return <span className="font-mono text-sm font-semibold">{row.matricula}</span>;
  }

  function corpoNome(row: UsuarioResposta) {
    return <span className="font-medium">{row.nome}</span>;
  }

  function corpoCnh(row: UsuarioResposta) {
    if (!row.cnh) return <span className="text-gray-400 text-xs">—</span>;
    return (
      <span className="flex flex-col leading-tight">
        <span>{row.cnh}</span>
        {row.cnhValidade && (
          <span className="text-xs text-gray-500">
            Válida até {new Date(row.cnhValidade + 'T00:00:00').toLocaleDateString('pt-BR')}
          </span>
        )}
      </span>
    );
  }

  function corpoStatus(row: UsuarioResposta) {
    return row.ativo
      ? <Badge color="success" variant="light">Ativo</Badge>
      : <Badge color="default" variant="light">Inativo</Badge>;
  }

  function corpoAcoes(row: UsuarioResposta) {
    return (
      <HStack alignItems="center" gap={2}>
        <Link href={`/motoristas/${row.id}/editar`} style={{ textDecoration: 'none' }}>
          <Button variant="light" color="primary" size="sm" leftIcon="PiPencilBold">
            Editar
          </Button>
        </Link>
        {row.ativo ? (
          <Button
            variant="light"
            color="warning"
            size="sm"
            leftIcon="PiProhibitBold"
            aria-label={`Inativar motorista ${row.nome}`}
            onPress={() => abrirDialog(row.id, row.nome, 'inativar')}
          >
            Inativar
          </Button>
        ) : (
          <Button
            variant="light"
            color="success"
            size="sm"
            leftIcon="PiCheckCircleBold"
            aria-label={`Reativar motorista ${row.nome}`}
            onPress={() => reativar(row.id)}
          >
            Reativar
          </Button>
        )}
        <Button
          variant="light"
          color="error"
          size="sm"
          leftIcon="PiTrashBold"
          aria-label={`Excluir motorista ${row.nome}`}
          onPress={() => abrirDialog(row.id, row.nome, 'excluir')}
        >
          Excluir
        </Button>
      </HStack>
    );
  }

  return (
    <div>
      {erro && <Alert color="error" className="mb-4">{erro}</Alert>}

      <DataTable
        value={motoristas}
        emptyMessage={
          <EstadoVazio
            icone="PiUsersBold"
            titulo="Nenhum motorista cadastrado"
            descricao="Os motoristas aparecerão aqui. Cadastre o primeiro para começar."
            cta={
              <Link href="/motoristas/novo" style={{ textDecoration: 'none' }}>
                <Button color="primary" size="sm" leftIcon="PiPlusBold">Cadastrar motorista</Button>
              </Link>
            }
          />
        }
        stripedRows
        className="w-full"
        style={{ borderRadius: 12, overflow: 'hidden' }}
      >
        <Column header="Matrícula" body={corpoMatricula} />
        <Column header="Nome" body={corpoNome} />
        <Column field="telefone" header="Telefone" body={(row: UsuarioResposta) => row.telefone ?? <span className="text-gray-400 text-xs">—</span>} />
        <Column header="CNH" body={corpoCnh} />
        <Column header="Status" body={corpoStatus} />
        <Column header="Ações" body={corpoAcoes} style={{ width: 200 }} />
      </DataTable>

      <DialogConfirmacao
        visivel={dialog !== null}
        titulo={dialog?.tipo === 'excluir' ? 'Excluir motorista' : 'Inativar motorista'}
        descricao={
          dialog?.tipo === 'excluir'
            ? `O motorista ${dialog?.nome ?? ''} será removido permanentemente do sistema.`
            : `O motorista ${dialog?.nome ?? ''} será inativado e não poderá acessar o sistema. Você pode reativá-lo a qualquer momento.`
        }
        palavraConfirmacao={dialog?.nome ?? ''}
        labelConfirmar={dialog?.tipo === 'excluir' ? 'Excluir motorista' : 'Inativar motorista'}
        onConfirmar={confirmarAcao}
        onCancelar={fecharDialog}
        carregando={isPending}
      />
    </div>
  );
}
