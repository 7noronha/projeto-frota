import { VStack, Placeload } from '@lojascem/components-react';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando configurações"
      className="mx-auto max-w-3xl"
    >
      <VStack className="gap-2 mb-6">
        <Placeload style={{ width: 200, height: 28 }} className="rounded" />
        <Placeload style={{ width: 220, height: 16 }} className="rounded" />
      </VStack>

      {Array.from({ length: 2 }).map((_, i) => (
        <Placeload
          key={i}
          style={{ width: '100%', height: 200 }}
          className="rounded-xl mb-4"
        />
      ))}

      <span className="sr-only">Carregando configurações...</span>
    </div>
  );
}
