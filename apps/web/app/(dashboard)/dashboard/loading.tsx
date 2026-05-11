import { HStack, VStack, Placeload } from '@lojascem/components-react';

export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label="Carregando painel">
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <VStack>
          <Placeload style={{ width: 100, height: 28 }} className="rounded" />
          <Placeload style={{ width: 240, height: 16 }} className="rounded mt-1" />
        </VStack>
        <Placeload style={{ width: 160, height: 36 }} className="rounded-md" />
      </HStack>

      {/* 4 cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Placeload key={i} style={{ width: '100%', height: 80 }} className="rounded-xl" />
        ))}
      </div>

      {/* Grid de viagens em andamento */}
      <Placeload style={{ width: 220, height: 24 }} className="rounded mb-3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Placeload key={i} style={{ width: '100%', height: 180 }} className="rounded-xl" />
        ))}
      </div>

      <span className="sr-only">Carregando painel...</span>
    </div>
  );
}
