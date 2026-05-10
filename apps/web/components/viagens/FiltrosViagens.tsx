'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ComboBox, ListBox, TextField, HStack } from '@lojascem/components-react';

interface FiltrosViagensProps {
  statusInicial?: string;
  dataInicioInicial?: string;
  dataFimInicial?: string;
}

const TODOS = 'todos';

export function FiltrosViagens({
  statusInicial = '',
  dataInicioInicial = '',
  dataFimInicial = '',
}: FiltrosViagensProps) {
  const router = useRouter();
  const [pendente, iniciarTransicao] = useTransition();
  const [status, setStatus] = useState(statusInicial || TODOS);
  const [dataInicio, setDataInicio] = useState(dataInicioInicial);
  const [dataFim, setDataFim] = useState(dataFimInicial);

  const temFiltro = status !== TODOS || dataInicio !== '' || dataFim !== '';

  function aplicarFiltros(novoStatus: string, novaDataInicio: string, novaDataFim: string) {
    const params = new URLSearchParams();
    if (novoStatus && novoStatus !== TODOS) params.set('status', novoStatus);
    if (novaDataInicio) params.set('dataInicio', novaDataInicio);
    if (novaDataFim) params.set('dataFim', novaDataFim);
    const query = params.toString();
    iniciarTransicao(() => {
      router.push(query ? `/viagens?${query}` : '/viagens', { scroll: false });
    });
  }

  function aoSubmeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    aplicarFiltros(status, dataInicio, dataFim);
  }

  function aoMudarStatus(chave: string | null) {
    const valor = chave ?? TODOS;
    setStatus(valor);
    aplicarFiltros(valor, dataInicio, dataFim);
  }

  function aoLimpar() {
    setStatus(TODOS);
    setDataInicio('');
    setDataFim('');
    iniciarTransicao(() => {
      router.push('/viagens', { scroll: false });
    });
  }

  return (
    <form onSubmit={aoSubmeter} className="mb-6" role="search" aria-label="Filtrar viagens">
      <HStack alignItems="end" gap={4} className="flex-wrap">
        <div style={{ minWidth: 220 }}>
          <ComboBox
            aria-label="Filtrar por status"
            size="sm"
            placeholder="Status"
            selectedKey={status}
            onSelectionChange={aoMudarStatus}
          >
            <ListBox.Item key={TODOS}>Todos os status</ListBox.Item>
            <ListBox.Item key="CRIADA">Criadas</ListBox.Item>
            <ListBox.Item key="EM_ANDAMENTO">Em andamento</ListBox.Item>
            <ListBox.Item key="FINALIZADA">Finalizadas</ListBox.Item>
          </ComboBox>
        </div>

        <TextField
          type="date"
          aria-label="Data início"
          placeholder="Data início"
          size="sm"
          value={dataInicio}
          onChange={setDataInicio}
        />

        <TextField
          type="date"
          aria-label="Data fim"
          placeholder="Data fim"
          size="sm"
          value={dataFim}
          onChange={setDataFim}
        />

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
