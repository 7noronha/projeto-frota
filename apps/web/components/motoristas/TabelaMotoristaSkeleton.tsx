import { HStack, VStack, Placeload } from '@lojascem/components-react';

export function TabelaMotoristaSkeleton() {
  return (
    <div>
      {/* Cabeçalho */}
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <VStack>
          <Placeload style={{ width: 140, height: 28 }} className="rounded" />
          <Placeload style={{ width: 100, height: 16 }} className="rounded mt-1" />
        </VStack>
        <Placeload style={{ width: 180, height: 36 }} className="rounded-md" />
      </HStack>

      {/* Tabela */}
      <div className="w-full overflow-hidden rounded-xl" style={{ border: '1px solid #e2e8f0' }}>
        {/* Header */}
        <HStack className="gap-6 px-4 py-3" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {[100, 180, 120, 140, 70, 140].map((w, i) => (
            <Placeload key={i} style={{ width: w, height: 12 }} className="rounded-full" />
          ))}
        </HStack>

        {/* Linhas */}
        {Array.from({ length: 6 }).map((_, i) => (
          <HStack
            key={i}
            alignItems="center"
            className="gap-6 px-4 py-4"
            style={{
              borderBottom: i < 5 ? '1px solid #f1f5f9' : 'none',
              background: i % 2 === 0 ? '#ffffff' : '#fafafa',
            }}
          >
            <Placeload style={{ width: 100, height: 16 }} />
            <Placeload style={{ width: 180, height: 16 }} />
            <Placeload style={{ width: 120, height: 16 }} />
            <Placeload style={{ width: 140, height: 16 }} />
            <Placeload style={{ width: 70, height: 24 }} className="rounded-full" />
            <Placeload style={{ width: 140, height: 32 }} className="rounded-md" />
          </HStack>
        ))}
      </div>
    </div>
  );
}
