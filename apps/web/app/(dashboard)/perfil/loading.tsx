import { VStack, Placeload } from '@lojascem/components-react';

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando perfil"
      className="mx-auto"
      style={{ maxWidth: 720 }}
    >
      <VStack className="gap-2 mb-6">
        <Placeload style={{ width: 160, height: 28 }} className="rounded" />
        <Placeload style={{ width: 260, height: 16 }} className="rounded" />
      </VStack>

      {/* Cards */}
      <Placeload style={{ width: '100%', height: 120 }} className="rounded-xl mb-4" />
      <Placeload style={{ width: '100%', height: 220 }} className="rounded-xl mb-4" />
      <Placeload style={{ width: '100%', height: 280 }} className="rounded-xl" />

      <span className="sr-only">Carregando perfil...</span>
    </div>
  );
}
