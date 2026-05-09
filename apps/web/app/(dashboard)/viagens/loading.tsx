import { HStack, VStack, Placeload } from '@lojascem/components-react';
import { TabelaViagensSkeleton } from '@/components/viagens/TabelaViagensSkeleton';

export default function Loading() {
  return (
    <div>
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <VStack gap={2}>
          <Placeload style={{ width: 96, height: 28 }} />
          <Placeload style={{ width: 192, height: 16 }} />
        </VStack>
        <Placeload style={{ width: 144, height: 36 }} className="rounded-lg" />
      </HStack>

      <HStack className="gap-3 mb-6">
        <Placeload style={{ width: 160, height: 36 }} className="rounded-md" />
        <Placeload style={{ width: 128, height: 36 }} className="rounded-md" />
        <Placeload style={{ width: 128, height: 36 }} className="rounded-md" />
        <Placeload style={{ width: 80, height: 36 }} className="rounded-md" />
      </HStack>

      <TabelaViagensSkeleton />
    </div>
  );
}
