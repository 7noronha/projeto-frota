'use client';

import { Card, HStack, VStack, Text, Badge, Heading } from '@lojascem/components-react';
import type { UsuarioResposta } from '@fleetops/types';
import { formatarDataIso } from '@fleetops/utils';

interface CardResumoPerfilProps {
  usuario: UsuarioResposta;
}

const ROTULO_PERFIL: Record<
  string,
  { texto: string; color: 'info' | 'warning' | 'success' | 'default' }
> = {
  admin: { texto: 'Administrador', color: 'warning' },
  gerente: { texto: 'Gerente', color: 'info' },
  encarregado: { texto: 'Encarregado', color: 'info' },
  operador: { texto: 'Operador', color: 'success' },
  motorista: { texto: 'Motorista', color: 'default' },
};

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function CardResumoPerfil({ usuario }: CardResumoPerfilProps): React.ReactElement {
  const meta = ROTULO_PERFIL[usuario.perfil] ?? {
    texto: usuario.perfil,
    color: 'default' as const,
  };

  const dataMembro = new Date(usuario.dataCriacao).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card>
      <Card.Content>
        <HStack alignItems="center" className="gap-5 flex-wrap">
          {/* Avatar com iniciais */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              background: '#0066FF',
              color: 'white',
              width: 72,
              height: 72,
              fontSize: 26,
              fontWeight: 700,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {iniciais(usuario.nome)}
          </div>

          <VStack className="gap-1 flex-1" style={{ minWidth: 0 }}>
            <Heading size="lg" weight="bold" style={{ color: '#0A2540' }}>
              {usuario.nome}
            </Heading>
            <HStack alignItems="center" className="gap-2 flex-wrap">
              <span className="inline-block whitespace-nowrap">
                <Badge color={meta.color} variant="light">
                  {meta.texto}
                </Badge>
              </span>
              <Text size="sm" style={{ color: '#64748b' }}>
                Matrícula <span className="font-mono font-semibold">{usuario.matricula}</span>
              </Text>
            </HStack>
            <Text size="xs" className="mt-1" style={{ color: '#94a3b8' }}>
              Membro desde {dataMembro}
            </Text>
          </VStack>

          {/* CNH se motorista */}
          {usuario.perfil === 'motorista' && usuario.cnh && (
            <div
              className="rounded-lg p-3"
              style={{ background: '#EFF6FF', minWidth: 200 }}
            >
              <Text
                size="xs"
                className="font-semibold uppercase tracking-wide"
                style={{ color: '#1D4ED8' }}
              >
                CNH
              </Text>
              <Text size="sm" className="font-mono font-semibold mt-1" style={{ color: '#0A2540' }}>
                {usuario.cnh}
              </Text>
              {usuario.cnhValidade && (
                <Text size="xs" className="mt-0.5" style={{ color: '#64748b' }}>
                  Válida até{' '}
                  {formatarDataIso(usuario.cnhValidade)}
                </Text>
              )}
            </div>
          )}
        </HStack>
      </Card.Content>
    </Card>
  );
}
