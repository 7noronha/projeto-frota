export function TabelaVeiculosSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-xl" style={{ border: '1px solid #e2e8f0' }}>
      {/* Header */}
      <div className="flex gap-6 px-4 py-3" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        {[80, 140, 70, 60, 100, 90, 100].map((w, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded"
            style={{ width: w, background: '#e2e8f0' }}
          />
        ))}
      </div>
      {/* Linhas */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 px-4 py-4"
          style={{
            borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none',
            background: i % 2 === 0 ? '#ffffff' : '#fafafa',
          }}
        >
          <div className="h-4 animate-pulse rounded" style={{ width: 80, background: '#f1f5f9' }} />
          <div className="h-4 animate-pulse rounded" style={{ width: 140, background: '#f1f5f9' }} />
          <div className="h-4 animate-pulse rounded" style={{ width: 70, background: '#f1f5f9' }} />
          <div className="h-4 animate-pulse rounded" style={{ width: 60, background: '#f1f5f9' }} />
          <div className="h-4 animate-pulse rounded" style={{ width: 100, background: '#f1f5f9' }} />
          <div className="h-5 animate-pulse rounded-full" style={{ width: 70, background: '#f1f5f9' }} />
          <div className="h-4 animate-pulse rounded" style={{ width: 100, background: '#f1f5f9' }} />
        </div>
      ))}
    </div>
  );
}
