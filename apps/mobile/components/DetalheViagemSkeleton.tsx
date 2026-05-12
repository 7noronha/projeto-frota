import { Box, VStack, HStack, Divider } from '@gluestack-ui/themed';
import { Skeleton } from './Skeleton';

function SecaoSkeleton(): React.ReactElement {
  return (
    <Box
      backgroundColor="$white"
      borderRadius="$xl"
      p="$4"
      borderWidth={1}
      borderColor="$borderLight200"
    >
      <Skeleton height={12} width={80} />
      <Box mt="$3">
        <Skeleton height={14} width="60%" />
        <Box mt="$2">
          <Skeleton height={14} width="80%" />
        </Box>
        <Box mt="$2">
          <Skeleton height={14} width="70%" />
        </Box>
      </Box>
    </Box>
  );
}

export function DetalheViagemSkeleton(): React.ReactElement {
  return (
    <VStack space="md" px="$4" py="$4">
      <HStack justifyContent="flex-end">
        <Skeleton height={24} width={100} borderRadius={9999} />
      </HStack>

      <Box>
        <Skeleton height={28} width="90%" />
        <Box mt="$2">
          <Skeleton height={14} width="60%" />
        </Box>
      </Box>

      <Divider />

      <SecaoSkeleton />
      <SecaoSkeleton />
    </VStack>
  );
}
