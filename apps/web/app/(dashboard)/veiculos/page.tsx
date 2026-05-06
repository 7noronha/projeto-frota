import Link from 'next/link';
import { TabelaVeiculos } from '@/components/veiculos/TabelaVeiculos';
import { buscarVeiculos } from './actions';
import { Button } from 'primereact/button';

export const dynamic = 'force-dynamic';

interface PaginaVeiculosProps {
  searchParams: Promise<{ pagina?: string; placa?: string; modelo?: string; situacao?: string }>;
}

export default async function PaginaVeiculos({ searchParams }: PaginaVeiculosProps) {
  const params = await searchParams;
  const pagina = Number(params.pagina ?? 1);

  const { dados, total, totalPaginas } = await buscarVeiculos(pagina, {
    placa: params.placa,
    modelo: params.modelo,
    situacao: params.situacao,
  });

  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0A2540' }}>
            Veículos
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
            {total} {total === 1 ? 'veículo cadastrado' : 'veículos cadastrados'}
          </p>
        </div>
        <Link href="/veiculos/novo" style={{ textDecoration: 'none' }}>
          <Button label="Novo veículo" icon="pi pi-plus" />
        </Link>
      </div>

      {/* Tabela */}
      <TabelaVeiculos veiculos={dados} />

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/veiculos?pagina=${p}`}
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
