import { TabelaViagensSkeleton } from '@/components/viagens/TabelaViagensSkeleton';

export default function Loading() {
  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-24 animate-pulse rounded" style={{ background: '#e2e8f0' }} />
          <div className="h-4 w-48 animate-pulse rounded" style={{ background: '#f1f5f9' }} />
        </div>
        <div className="h-9 w-36 animate-pulse rounded-lg" style={{ background: '#e2e8f0' }} />
      </div>
      {/* Filtros */}
      <div className="mb-6 flex gap-3">
        <div className="h-9 w-40 animate-pulse rounded-md" style={{ background: '#f1f5f9' }} />
        <div className="h-9 w-32 animate-pulse rounded-md" style={{ background: '#f1f5f9' }} />
        <div className="h-9 w-32 animate-pulse rounded-md" style={{ background: '#f1f5f9' }} />
        <div className="h-9 w-20 animate-pulse rounded-md" style={{ background: '#f1f5f9' }} />
      </div>
      <TabelaViagensSkeleton />
    </div>
  );
}
