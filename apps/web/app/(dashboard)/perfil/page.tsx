import type { Metadata } from 'next';
import { VStack, Heading, Text } from '@lojascem/components-react';
import { CardResumoPerfil } from '@/components/perfil/CardResumoPerfil';
import { CardDadosPessoais } from '@/components/perfil/CardDadosPessoais';
import { CardTrocarSenha } from '@/components/perfil/CardTrocarSenha';
import { buscarMeuPerfil } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Perfil — FleetOps' };

export default async function PaginaPerfil(): Promise<React.ReactElement> {
  const usuario = await buscarMeuPerfil();

  return (
    <VStack className="gap-6 mx-auto" style={{ maxWidth: 720 }}>
      <VStack>
        <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
          Meu perfil
        </Heading>
        <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
          Gerencie seus dados pessoais e troque sua senha.
        </Text>
      </VStack>

      <CardResumoPerfil usuario={usuario} />
      <CardDadosPessoais usuario={usuario} />
      <CardTrocarSenha />
    </VStack>
  );
}
