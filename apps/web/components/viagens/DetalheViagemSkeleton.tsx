export function DetalheViagemSkeleton() {
  function CardSkeleton({ linhas }: { linhas: number }) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ border: '1px solid #e2e8f0', background: '#ffffff' }}
      >
        <div className="h-4 w-32 animate-pulse rounded" style={{ background: '#e2e8f0', marginBottom: 16 }} />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {Array.from({ length: linhas }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-24 animate-pulse rounded" style={{ background: '#f1f5f9' }} />
              <div className="h-4 w-36 animate-pulse rounded" style={{ background: '#e2e8f0' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-48 animate-pulse rounded" style={{ background: '#e2e8f0' }} />
          <div className="h-4 w-64 animate-pulse rounded" style={{ background: '#f1f5f9' }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-24 animate-pulse rounded-full" style={{ background: '#e2e8f0' }} />
          <div className="h-8 w-20 animate-pulse rounded-lg" style={{ background: '#f1f5f9' }} />
        </div>
      </div>
      {/* Cards */}
      <CardSkeleton linhas={6} />
      <div className="grid grid-cols-2 gap-4">
        <CardSkeleton linhas={2} />
        <CardSkeleton linhas={2} />
      </div>
    </div>
  );
}
