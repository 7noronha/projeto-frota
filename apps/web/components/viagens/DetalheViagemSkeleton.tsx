import { HStack, VStack, Placeload } from '@minha-empresa/components-react';

export function DetalheViagemSkeleton() {
  function CardSkeleton({ linhas }: { linhas: number }) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ border: '1px solid #e2e8f0', background: '#ffffff' }}
      >
        <Placeload width={128} height={16} className="mb-4" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {Array.from({ length: linhas }).map((_, i) => (
            <VStack key={i} gap="1">
              <Placeload width={96} height={12} />
              <Placeload width={144} height={16} />
            </VStack>
          ))}
        </div>
      </div>
    );
  }

  return (
    <VStack gap="6" className="mx-auto max-w-3xl">
      {/* Cabeçalho */}
      <HStack align="center" justify="between">
        <VStack gap="2">
          <Placeload width={192} height={28} />
          <Placeload width={256} height={16} />
        </VStack>
        <HStack align="center" gap="3">
          <Placeload width={96} height={28} rounded />
          <Placeload width={80} height={32} className="rounded-lg" />
        </HStack>
      </HStack>

      {/* Cards */}
      <CardSkeleton linhas={6} />
      <div className="grid grid-cols-2 gap-4">
        <CardSkeleton linhas={2} />
        <CardSkeleton linhas={2} />
      </div>
    </VStack>
  );
}
