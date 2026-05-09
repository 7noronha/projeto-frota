'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ComboBox, ListBox, SearchField, HStack } from '@lojascem/components-react';

interface FiltrosMotoristasProps {
  nomeInicial?: string;
  ativoInicial?: string;
}

const OPCOES_STATUS = [
  { id: '', nome: 'Todos' },
  { id: 'true', nome: 'Ativos' },
  { id: 'false', nome: 'Inativos' },
];

export function FiltrosMotoristas({ nomeInicial = '', ativoInicial = '' }: FiltrosMotoristasProps) {
  const router = useRouter();
  const [pendente, iniciarTransicao] = useTransition();
  const [nome, setNome] = useState(nomeInicial);
  const [ativo, setAtivo] = useState(ativoInicial);

  const temFiltro = nome.trim() !== '' || ativo !== '';

  function aplicarFiltros(novoNome: string, novoAtivo: string) {
    const params = new URLSearchParams();
    if (novoNome.trim()) params.set('nome', novoNome.trim());
    if (novoAtivo) params.set('ativo', novoAtivo);
    const query = params.toString();
    iniciarTransicao(() => {
      router.push(query ? `/motoristas?${query}` : '/motoristas', { scroll: false });
    });
  }

  function aoSubmeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    aplicarFiltros(nome, ativo);
  }

  function aoMudarStatus(chave: string | null) {
    const valor = chave ?? '';
    setAtivo(valor);
    aplicarFiltros(nome, valor);
  }

  function aoLimpar() {
    setNome('');
    setAtivo('');
    iniciarTransicao(() => {
      router.push('/motoristas', { scroll: false });
    });
  }

  return (
    <form onSubmit={aoSubmeter} className="mb-6" role="search" aria-label="Filtrar motoristas">
      <HStack alignItems="end" gap={4} className="flex-wrap">
        <div style={{ minWidth: 280, flex: '1 1 280px', maxWidth: 360 }}>
          <SearchField
            aria-label="Buscar por nome"
            placeholder="Buscar por nome..."
            size="sm"
            value={nome}
            onChange={setNome}
            onSubmit={(valor: string) => aplicarFiltros(valor, ativo)}
          />
        </div>

        <div style={{ minWidth: 180 }}>
          <ComboBox
            aria-label="Filtrar por status"
            size="sm"
            placeholder="Status"
            defaultItems={OPCOES_STATUS}
            selectedKey={ativo}
            onSelectionChange={aoMudarStatus}
          >
            {(item) => <ListBox.Item key={item.id}>{item.nome}</ListBox.Item>}
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
