import { HStack, VStack, Placeload } from '@minha-empresa/components-react';
import { TabelaViagensSkeleton } from '@/components/viagens/TabelaViagensSkeleton';

export default function Loading() {
  return (
    <div>
      <HStack align="center" justify="between" className="mb-6">
        <VStack gap="2">
          <Placeload width={96} height={28} />
          <Placeload width={192} height={16} />
        </VStack>
        <Placeload width={144} height={36} className="rounded-lg" />
      </HStack>

      <HStack gap="3" className="mb-6">
        <Placeload width={160} height={36} className="rounded-md" />
        <Placeload width={128} height={36} className="rounded-md" />
        <Placeload width={128} height={36} className="rounded-md" />
        <Placeload width={80} height={36} className="rounded-md" />
      </HStack>

      <TabelaViagensSkeleton />
    </div>
  );
}
