import { HStack, VStack, Placeload } from '@lojascem/components-react';
import { TabelaVeiculosSkeleton } from '@/components/veiculos/TabelaVeiculosSkeleton';

export default function Loading() {
  return (
    <div>
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <VStack gap={2}>
          <Placeload style={{ width: 112, height: 28 }} />
          <Placeload style={{ width: 176, height: 16 }} />
        </VStack>
        <Placeload style={{ width: 144, height: 36 }} className="rounded-lg" />
      </HStack>
      <TabelaVeiculosSkeleton />
    </div>
  );
}
