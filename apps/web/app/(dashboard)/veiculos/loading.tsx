import { TabelaVeiculosSkeleton } from '@/components/veiculos/TabelaVeiculosSkeleton';

export default function Loading() {
  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-28 animate-pulse rounded" style={{ background: '#e2e8f0' }} />
          <div className="h-4 w-44 animate-pulse rounded" style={{ background: '#f1f5f9' }} />
        </div>
        <div className="h-9 w-36 animate-pulse rounded-lg" style={{ background: '#e2e8f0' }} />
      </div>
      <TabelaVeiculosSkeleton />
    </div>
  );
}
