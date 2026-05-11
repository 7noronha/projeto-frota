'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, HStack, VStack, Text, Button } from '@lojascem/components-react';

const itensMenu = [
  { href: '/dashboard', rotulo: 'Painel', icone: 'PiSquaresFourBold' as const },
  { href: '/veiculos', rotulo: 'Veículos', icone: 'PiCarBold' as const },
  { href: '/motoristas', rotulo: 'Motoristas', icone: 'PiUsersBold' as const },
  { href: '/viagens', rotulo: 'Viagens', icone: 'PiMapTrifoldBold' as const },
  { href: '/usuarios', rotulo: 'Usuários', icone: 'PiUserListBold' as const },
  { href: '/configuracoes', rotulo: 'Configurações', icone: 'PiGearBold' as const },
];

export function NavegacaoPrincipal() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSair() {
    await fetch('/api/auth/sair', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside
      aria-label="Navegação principal"
      className="flex h-screen w-64 flex-col"
      style={{
        background: '#0A2540',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <HStack
        alignItems="center"
        gap={4}
        className="h-16 px-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ background: '#0066FF', width: 32, height: 32 }}
        >
          <Icon name="PiTruckBold" size="sm" color="light" />
        </div>
        <Text as="span" size="xl" className="font-bold text-white">FleetOps</Text>
      </HStack>

      {/* Menu */}
      <nav aria-label="Menu" className="flex-1 px-3 py-4">
        <VStack gap={2}>
          {itensMenu.map((item) => {
            const ativo = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? 'page' : undefined}
                className="nav-sidebar-item"
                data-active={ativo ? 'true' : undefined}
              >
                <Icon name={item.icone} size="md" color="light" />
                <Text as="span" size="sm" className="font-medium text-white">{item.rotulo}</Text>
              </Link>
            );
          })}
        </VStack>
      </nav>

      {/* Sair */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Button
          color="error"
          isBlock
          leftIcon="PiSignOutBold"
          onPress={handleSair}
          aria-label="Sair do sistema"
          className="btn-sair"
        >
          Sair
        </Button>
      </div>
    </aside>
  );
}
