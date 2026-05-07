'use client';

import { Button, Icon, VStack, HStack, Heading, Text } from '@minha-empresa/components-react';

interface EstadoErroProps {
  titulo?: string;
  descricao?: string;
  onTentarNovamente: () => void;
}

export function EstadoErro({
  titulo = 'Não conseguimos carregar os dados',
  descricao = 'Pode ser uma instabilidade temporária. Tente novamente em alguns instantes.',
  onTentarNovamente,
}: EstadoErroProps) {
  return (
    <VStack
      role="alert"
      align="center"
      justify="center"
      className="rounded-xl px-6 py-14 text-center"
      style={{ border: '1px solid #fca5a5', background: '#fef2f2' }}
    >
      <Icon name="PiWarningCircleBold" size="xl" color="error" />
      <Heading as="h3" size="md" weight="semibold" className="mt-3" style={{ color: '#1e293b' }}>
        {titulo}
      </Heading>
      <Text size="sm" className="mt-1 max-w-sm" style={{ color: '#64748b' }}>
        {descricao}
      </Text>
      <HStack align="center" gap="3" className="mt-6">
        <Button
          variant="outline"
          color="error"
          size="sm"
          leftIcon="PiArrowClockwiseBold"
          onClick={onTentarNovamente}
        >
          Tentar novamente
        </Button>
        <Button
          variant="ghost"
          color="default"
          size="sm"
          onClick={() => { window.location.href = 'mailto:ti@empresa.com'; }}
        >
          Falar com suporte
        </Button>
      </HStack>
    </VStack>
  );
}
