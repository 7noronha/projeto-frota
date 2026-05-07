import { Icon, Button, VStack, Heading, Text } from '@minha-empresa/components-react';

interface EstadoVazioFiltroProps {
  onLimpar: () => void;
}

export function EstadoVazioFiltro({ onLimpar }: EstadoVazioFiltroProps) {
  return (
    <VStack align="center" justify="center" className="px-6 py-16 text-center">
      <Icon name="PiMagnifyingGlassBold" size="xl" color="contentTernary" />
      <Heading as="h3" size="sm" weight="semibold" className="mt-3" style={{ color: '#1e293b' }}>
        Nenhum resultado
      </Heading>
      <Text size="sm" className="mt-1 max-w-sm" style={{ color: '#64748b' }}>
        Os filtros aplicados não retornaram resultados. Tente ajustar ou limpar os filtros.
      </Text>
      <Button
        variant="outline"
        color="default"
        size="sm"
        className="mt-4"
        onClick={onLimpar}
        type="button"
      >
        Limpar filtros
      </Button>
    </VStack>
  );
}
