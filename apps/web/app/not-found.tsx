import Image from 'next/image';
import Link from 'next/link';
import { VStack, Heading, Text } from '@minha-empresa/components-react';

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f4ff] px-6">
      <VStack gap="6" align="center" className="text-center">
        <Image
          src="/404-ilustracao.svg"
          alt="Ilustração de página não encontrada"
          width={380}
          height={280}
          priority
        />

        <VStack gap="2">
          <Heading as="h1" size="2xl" weight="bold" style={{ color: '#0a2540' }}>
            Página não encontrada
          </Heading>
          <Text size="md" style={{ color: '#64748b' }}>
            O endereço que você acessou não existe ou foi movido.
          </Text>
        </VStack>

        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-full bg-[#0066ff] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0047b3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:ring-offset-2"
          style={{ textDecoration: 'none' }}
        >
          Voltar para o início
        </Link>
      </VStack>
    </main>
  );
}
