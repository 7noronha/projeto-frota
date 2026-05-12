import { Box, VStack, HStack } from '@gluestack-ui/themed';
import { Skeleton } from './Skeleton';

function CartaoSkeleton(): React.ReactElement {
  return (
    <Box
      backgroundColor="$white"
      borderRadius="$xl"
      p="$4"
      mb="$3"
      borderWidth={1}
      borderColor="$borderLight200"
    >
      <HStack justifyContent="space-between" alignItems="flex-start" mb="$3">
        <Box flex={1} mr="$2">
          <Skeleton height={18} width="80%" />
        </Box>
        <Skeleton height={24} width={90} borderRadius={9999} />
      </HStack>
      <HStack space="md" mt="$1">
        <Skeleton height={14} width={80} />
        <Skeleton height={14} width={100} />
      </HStack>
    </Box>
  );
}

interface ListaViagensSkeletonProps {
  quantidade?: number;
}

export function ListaViagensSkeleton({
  quantidade = 4,
}: ListaViagensSkeletonProps): React.ReactElement {
  return (
    <VStack px="$4" pt="$4">
      {Array.from({ length: quantidade }).map((_, i) => (
        <CartaoSkeleton key={i} />
      ))}
    </VStack>
  );
}
