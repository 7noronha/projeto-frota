'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge, Button, Alert, HStack } from '@lojascem/components-react';
import {
  acaoInativarUsuario,
  acaoReativarUsuario,
  acaoExcluirUsuario,
} from '@/app/(dashboard)/usuarios/actions';
import { EstadoVazio } from '@/components/EstadoVazio';
import { DialogConfirmacao } from '@/components/DialogConfirmacao';
import { notificar } from '@/lib/notificar';
import type { UsuarioResposta } from '@fleetops/types';

interface TabelaUsuariosProps {
  usuarios: UsuarioResposta[];
}

const ROTULOS_PERFIL: Record<string, { texto: string; color: 'info' | 'warning' | 'default' | 'success' }> = {
  admin: { texto: 'Administrador', color: 'warning' },
  gerente: { texto: 'Gerente', color: 'info' },
  encarregado: { texto: 'Encarregado', color: 'info' },
  operador: { texto: 'Operador', color: 'success' },
  motorista: { texto: 'Motorista', color: 'default' },
};

export function TabelaUsuarios({ usuarios }: TabelaUsuariosProps) {
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
    const { id, nome, tipo } = dialog;
    startTransition(async () => {
      const acao = tipo === 'inativar' ? acaoInativarUsuario(id) : acaoExcluirUsuario(id);
      const resultado = await acao;
      if (resultado?.erro) {
        setErro(resultado.erro);
        notificar.erro(resultado.erro);
      } else {
        notificar.sucesso(
          tipo === 'inativar'
            ? `${nome} foi inativado(a).`
            : `${nome} foi excluído(a) do sistema.`,
        );
      }
      setDialog(null);
    });
  }

  function reativar(id: string, nome: string) {
    setErro(null);
    startTransition(async () => {
      const resultado = await acaoReativarUsuario(id);
      if (resultado?.erro) {
        setErro(resultado.erro ?? null);
        notificar.erro(resultado.erro);
      } else {
        notificar.sucesso(`${nome} foi reativado(a).`);
      }
    });
  }

  function corpoMatricula(row: UsuarioResposta) {
    return <span className="font-mono text-sm font-semibold">{row.matricula}</span>;
  }

  function corpoNome(row: UsuarioResposta) {
    return <span className="font-medium">{row.nome}</span>;
  }

  function corpoPerfil(row: UsuarioResposta) {
    const meta = ROTULOS_PERFIL[row.perfil] ?? { texto: row.perfil, color: 'default' as const };
    return (
      <Badge color={meta.color} variant="light">
        {meta.texto}
      </Badge>
    );
  }

  function corpoStatus(row: UsuarioResposta) {
    return row.ativo ? (
      <Badge color="success" variant="light">Ativo</Badge>
    ) : (
      <Badge color="default" variant="light">Inativo</Badge>
    );
  }

  function corpoAcoes(row: UsuarioResposta) {
    return (
      <HStack alignItems="center" gap={2}>
        <Link href={`/usuarios/${row.id}/editar`} style={{ textDecoration: 'none' }}>
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
            aria-label={`Inativar usuário ${row.nome}`}
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
            aria-label={`Reativar usuário ${row.nome}`}
            onPress={() => reativar(row.id, row.nome)}
          >
            Reativar
          </Button>
        )}
        <Button
          variant="light"
          color="error"
          size="sm"
          leftIcon="PiTrashBold"
          aria-label={`Excluir usuário ${row.nome}`}
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
        value={usuarios}
        emptyMessage={
          <EstadoVazio
            icone="PiUserListBold"
            titulo="Nenhum usuário cadastrado"
            descricao="Os usuários aparecerão aqui. Cadastre o primeiro para começar."
            cta={
              <Link href="/usuarios/novo" style={{ textDecoration: 'none' }}>
                <Button color="primary" size="sm" leftIcon="PiPlusBold">
                  Cadastrar usuário
                </Button>
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
        <Column header="Perfil" body={corpoPerfil} />
        <Column
          field="telefone"
          header="Telefone"
          body={(row: UsuarioResposta) =>
            row.telefone ?? <span className="text-gray-400 text-xs">—</span>
          }
        />
        <Column header="Status" body={corpoStatus} />
        <Column header="Ações" body={corpoAcoes} style={{ width: 260 }} />
      </DataTable>

      <DialogConfirmacao
        visivel={dialog !== null}
        titulo={dialog?.tipo === 'excluir' ? 'Excluir usuário' : 'Inativar usuário'}
        descricao={
          dialog?.tipo === 'excluir'
            ? `O usuário ${dialog?.nome ?? ''} será removido permanentemente do sistema.`
            : `O usuário ${dialog?.nome ?? ''} será inativado e não poderá acessar o sistema. Você pode reativá-lo a qualquer momento.`
        }
        palavraConfirmacao={dialog?.nome ?? ''}
        labelConfirmar={dialog?.tipo === 'excluir' ? 'Excluir usuário' : 'Inativar usuário'}
        onConfirmar={confirmarAcao}
        onCancelar={fecharDialog}
        carregando={isPending}
      />
    </div>
  );
}
