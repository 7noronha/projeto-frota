import Link from 'next/link';
import { TabelaViagens } from '@/components/viagens/TabelaViagens';
import { buscarViagens } from './actions';
import { Button } from 'primereact/button';

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A2540' }}>
            Viagens
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
            {total} {total === 1 ? 'viagem encontrada' : 'viagens encontradas'}
          </p>
        </div>
        <Link href="/viagens/nova" style={{ textDecoration: 'none' }}>
          <Button label="Nova viagem" icon="pi pi-plus" />
        </Link>
      </div>

      {/* Filtros */}
      <form method="GET" className="mb-6 flex flex-wrap gap-3 items-center">
        <select
          name="status"
          defaultValue={params.status ?? ''}
          className="h-9 rounded-md border px-3 text-sm"
          style={{ borderColor: '#e2e8f0', color: '#374151' }}
        >
          {STATUS_OPCOES.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="dataInicio"
          defaultValue={params.dataInicio}
          className="h-9 rounded-md border px-3 text-sm"
          style={{ borderColor: '#e2e8f0', color: '#374151' }}
        />
        <input
          type="date"
          name="dataFim"
          defaultValue={params.dataFim}
          className="h-9 rounded-md border px-3 text-sm"
          style={{ borderColor: '#e2e8f0', color: '#374151' }}
        />
        <button
          type="submit"
          className="h-9 rounded-md border px-4 text-sm font-medium cursor-pointer"
          style={{ borderColor: '#e2e8f0', color: '#374151', background: 'white' }}
        >
          Filtrar
        </button>
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
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/viagens?pagina=${p}`}
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
          ))}
        </div>
      )}
    </div>
  );
}
