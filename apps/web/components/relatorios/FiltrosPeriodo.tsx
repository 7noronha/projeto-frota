'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, HStack } from '@lojascem/components-react';

interface FiltrosPeriodoProps {
  dataInicioInicial?: string;
  dataFimInicial?: string;
}

export function FiltrosPeriodo({
  dataInicioInicial = '',
  dataFimInicial = '',
}: FiltrosPeriodoProps) {
  const router = useRouter();
  const [pendente, iniciarTransicao] = useTransition();
  const [dataInicio, setDataInicio] = useState(dataInicioInicial);
  const [dataFim, setDataFim] = useState(dataFimInicial);

  const temFiltro = dataInicio !== '' || dataFim !== '';

  function aplicar(di: string, df: string) {
    const params = new URLSearchParams();
    if (di) params.set('dataInicio', di);
    if (df) params.set('dataFim', df);
    const query = params.toString();
    iniciarTransicao(() => {
      router.push(query ? `/relatorios?${query}` : '/relatorios', { scroll: false });
    });
  }

  function aoSubmeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    aplicar(dataInicio, dataFim);
  }

  function aoLimpar() {
    setDataInicio('');
    setDataFim('');
    iniciarTransicao(() => router.push('/relatorios', { scroll: false }));
  }

  return (
    <form onSubmit={aoSubmeter} className="mb-6" role="search" aria-label="Filtrar por período">
      <HStack alignItems="end" gap={4} className="flex-wrap">
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
