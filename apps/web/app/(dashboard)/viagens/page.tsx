import Link from 'next/link';
import { TabelaViagens } from '@/components/viagens/TabelaViagens';
import { buscarViagens } from './actions';
import { Button, TextField, HStack, VStack, Heading, Text } from '@lojascem/components-react';

export const dynamic = 'force-dynamic';

const STATUS_OPCOES = [
  { valor: '', rotulo: 'Todos os status' },
  { valor: 'CRIADA', rotulo: 'Criadas' },
  { valor: 'EM_ANDAMENTO', rotulo: 'Em andamento' },
  { valor: 'FINALIZADA', rotulo: 'Finalizadas' },
];

interface PaginaViagensProps {
  searchParams: Promise<{ pagina?: string; status?: string; dataInicio?: string; dataFim?: string }>;
}

export default async function PaginaViagens({ searchParams }: PaginaViagensProps) {
  const params = await searchParams;
  const pagina = Number(params.pagina ?? 1);

  const temFiltrosAtivos = Boolean(params.status ?? params.dataInicio ?? params.dataFim);

  const { dados, total, totalPaginas } = await buscarViagens(pagina, {
    status: params.status,
    dataInicio: params.dataInicio,
    dataFim: params.dataFim,
  });

  return (
    <div>
      {/* Cabeçalho */}
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <VStack>
          <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
            Viagens
          </Heading>
          <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
            {total} {total === 1 ? 'viagem encontrada' : 'viagens encontradas'}
          </Text>
        </VStack>
        <Link href="/viagens/nova" style={{ textDecoration: 'none' }}>
          <Button color="primary" leftIcon="PiPlusBold">Nova viagem</Button>
        </Link>
      </HStack>

      {/* Filtros */}
      <form method="GET" className="mb-6 flex flex-wrap gap-3 items-end">
        <select
          name="status"
          defaultValue={params.status ?? ''}
          className="rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ borderColor: '#d1d5db', height: '34px', color: '#111827' }}
        >
          {STATUS_OPCOES.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>

        <TextField
          type="date"
          name="dataInicio"
          defaultValue={params.dataInicio}
          size="sm"
          placeholder="Data início"
        />

        <TextField
          type="date"
          name="dataFim"
          defaultValue={params.dataFim}
          size="sm"
          placeholder="Data fim"
        />

        <Button type="submit" variant="outline" color="default" size="sm">
          Filtrar
        </Button>

        {(params.status || params.dataInicio || params.dataFim) && (
          <Link href="/viagens" className="text-sm" style={{ color: '#64748b' }}>
            Limpar filtros
          </Link>
        )}
      </form>

      {/* Tabela */}
      <TabelaViagens viagens={dados} temFiltrosAtivos={temFiltrosAtivos} />

      {/* Paginação */}
      {totalPaginas > 1 && (
        <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => {
            const sp = new URLSearchParams();
            if (params.status) sp.set('status', params.status);
            if (params.dataInicio) sp.set('dataInicio', params.dataInicio);
            if (params.dataFim) sp.set('dataFim', params.dataFim);
            sp.set('pagina', String(p));
            return (
              <Link
                key={p}
                href={`/viagens?${sp.toString()}`}
                aria-label={`Página ${p}${p === pagina ? ' (atual)' : ''}`}
                aria-current={p === pagina ? 'page' : undefined}
                className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium"
                style={{
                  background: p === pagina ? '#0066FF' : 'white',
                  color: p === pagina ? 'white' : '#374151',
                  border: p === pagina ? 'none' : '1px solid #e2e8f0',
                  textDecoration: 'none',
                }}
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
