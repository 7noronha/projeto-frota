import Image from 'next/image';
import Link from 'next/link';
import { VStack, HStack, Heading, Text, Icon } from '@lojascem/components-react';

const atalhos = [
  { href: '/dashboard', rotulo: 'Painel', icone: 'PiSquaresFourBold' as const },
  { href: '/viagens', rotulo: 'Viagens', icone: 'PiMapTrifoldBold' as const },
  { href: '/veiculos', rotulo: 'Veículos', icone: 'PiCarBold' as const },
  { href: '/motoristas', rotulo: 'Motoristas', icone: 'PiUsersBold' as const },
];

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f4ff] px-6 py-10">
      <VStack alignItems="center" className="gap-6 text-center" style={{ maxWidth: 560 }}>
        <Image
          src="/404-ilustracao.svg"
          alt="Ilustração de página não encontrada"
          width={320}
          height={240}
          priority
        />

        <VStack gap={2}>
          <Heading size="2xl" weight="bold" style={{ color: '#0a2540' }}>
            Página não encontrada
          </Heading>
          <Text size="md" style={{ color: '#64748b' }}>
            O endereço que você acessou não existe ou foi movido. Use os
            atalhos abaixo para continuar.
          </Text>
        </VStack>

        {/* Grid de atalhos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-2">
          {atalhos.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-xl bg-white p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              style={{ border: '1px solid #e2e8f0', textDecoration: 'none' }}
            >
              <VStack alignItems="center" gap={2}>
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{ background: '#EFF6FF', color: '#0066FF', width: 40, height: 40 }}
                >
                  <Icon name={a.icone} size="md" color="primary" />
                </div>
                <Text size="sm" className="font-semibold" style={{ color: '#0a2540' }}>
                  {a.rotulo}
                </Text>
              </VStack>
            </Link>
          ))}
        </div>

        <HStack alignItems="center" className="gap-1 mt-2">
          <Text size="sm" style={{ color: '#64748b' }}>
            Ou
          </Text>
          <Link
            href="/"
            className="text-sm font-semibold"
            style={{ color: '#0066FF', textDecoration: 'none' }}
          >
            voltar ao início
          </Link>
        </HStack>
      </VStack>
    </main>
  );
}
