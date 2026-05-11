'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ComboBox, ListBox, SearchField, HStack } from '@lojascem/components-react';

interface FiltrosUsuariosProps {
  nomeInicial?: string;
  perfilInicial?: string;
  ativoInicial?: string;
}

const TODOS = 'todos';

export function FiltrosUsuarios({
  nomeInicial = '',
  perfilInicial = '',
  ativoInicial = '',
}: FiltrosUsuariosProps) {
  const router = useRouter();
  const [pendente, iniciarTransicao] = useTransition();
  const [nome, setNome] = useState(nomeInicial);
  const [perfil, setPerfil] = useState(perfilInicial || TODOS);
  const [ativo, setAtivo] = useState(ativoInicial || TODOS);

  const temFiltro = nome.trim() !== '' || perfil !== TODOS || ativo !== TODOS;

  function aplicar(nv: string, np: string, na: string) {
    const params = new URLSearchParams();
    if (nv.trim()) params.set('nome', nv.trim());
    if (np && np !== TODOS) params.set('perfil', np);
    if (na && na !== TODOS) params.set('ativo', na);
    const query = params.toString();
    iniciarTransicao(() => {
      router.push(query ? `/usuarios?${query}` : '/usuarios', { scroll: false });
    });
  }

  function aoSubmeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    aplicar(nome, perfil, ativo);
  }

  function aoMudarPerfil(chave: string | null) {
    const v = chave ?? TODOS;
    setPerfil(v);
    aplicar(nome, v, ativo);
  }

  function aoMudarAtivo(chave: string | null) {
    const v = chave ?? TODOS;
    setAtivo(v);
    aplicar(nome, perfil, v);
  }

  function aoLimpar() {
    setNome('');
    setPerfil(TODOS);
    setAtivo(TODOS);
    iniciarTransicao(() => {
      router.push('/usuarios', { scroll: false });
    });
  }

  return (
    <form onSubmit={aoSubmeter} className="mb-6" role="search" aria-label="Filtrar usuários">
      <HStack alignItems="end" gap={4} className="flex-wrap">
        <div style={{ minWidth: 240, flex: '1 1 240px', maxWidth: 320 }}>
          <SearchField
            aria-label="Buscar por nome"
            placeholder="Buscar por nome..."
            size="sm"
            value={nome}
            onChange={setNome}
            onSubmit={(v: string) => aplicar(v, perfil, ativo)}
          />
        </div>

        <div style={{ minWidth: 180 }}>
          <ComboBox
            aria-label="Filtrar por perfil"
            size="sm"
            placeholder="Perfil"
            selectedKey={perfil}
            onSelectionChange={aoMudarPerfil}
          >
            <ListBox.Item key={TODOS}>Todos perfis</ListBox.Item>
            <ListBox.Item key="admin">Administrador</ListBox.Item>
            <ListBox.Item key="gerente">Gerente</ListBox.Item>
            <ListBox.Item key="encarregado">Encarregado</ListBox.Item>
            <ListBox.Item key="operador">Operador</ListBox.Item>
            <ListBox.Item key="motorista">Motorista</ListBox.Item>
          </ComboBox>
        </div>

        <div style={{ minWidth: 180 }}>
          <ComboBox
            aria-label="Filtrar por status"
            size="sm"
            placeholder="Status"
            selectedKey={ativo}
            onSelectionChange={aoMudarAtivo}
          >
            <ListBox.Item key={TODOS}>Todos</ListBox.Item>
            <ListBox.Item key="true">Ativos</ListBox.Item>
            <ListBox.Item key="false">Inativos</ListBox.Item>
          </ComboBox>
        </div>

        <Button
          type="submit"
          variant="outline"
          color="default"
          size="sm"
          isLoading={pendente}
          leftIcon="PiFunnelBold"
        >
          Filtrar
        </Button>

        {temFiltro && (
          <Button
            type="button"
            variant="light"
            color="default"
            size="sm"
            onPress={aoLimpar}
            isDisabled={pendente}
          >
            Limpar
          </Button>
        )}
      </HStack>
    </form>
  );
}
