import { HStack, VStack, Placeload } from '@minha-empresa/components-react';
import { TabelaVeiculosSkeleton } from '@/components/veiculos/TabelaVeiculosSkeleton';

export default function Loading() {
  return (
    <div>
      <HStack align="center" justify="between" className="mb-6">
        <VStack gap="2">
          <Placeload width={112} height={28} />
          <Placeload width={176} height={16} />
        </VStack>
        <Placeload width={144} height={36} className="rounded-lg" />
      </HStack>
      <TabelaVeiculosSkeleton />
    </div>
  );
}
