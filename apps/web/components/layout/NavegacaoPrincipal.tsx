'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, HStack, VStack, Text } from '@lojascem/components-react';

const itensMenu = [
  { href: '/dashboard', rotulo: 'Painel', icone: 'PiSquaresFourBold' as const },
  { href: '/alertas', rotulo: 'Alertas', icone: 'PiBellBold' as const },
  { href: '/veiculos', rotulo: 'Veículos', icone: 'PiCarBold' as const },
  { href: '/motoristas', rotulo: 'Motoristas', icone: 'PiUsersBold' as const },
  { href: '/viagens', rotulo: 'Viagens', icone: 'PiMapTrifoldBold' as const },
  { href: '/usuarios', rotulo: 'Usuários', icone: 'PiUserListBold' as const },
  { href: '/relatorios', rotulo: 'Relatórios', icone: 'PiChartBarBold' as const },
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
      className="sidebar flex h-screen flex-col"
      style={{
        width: 240,
        flexShrink: 0,
        background: '#0A2540',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
        {/* Logo */}
        <HStack
          alignItems="center"
          gap={4}
          className="h-16 px-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}
        >
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ background: '#0066FF', width: 32, height: 32, flexShrink: 0 }}
          >
            <Icon name="PiTruckBold" size="sm" color="light" />
          </div>
          <Text as="span" size="xl" className="font-bold text-white">
            FleetOps
          </Text>
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
                  <Text as="span" size="sm" className="font-medium text-white">
                    {item.rotulo}
                  </Text>
                </Link>
              );
            })}
          </VStack>
        </nav>

        {/* Perfil + Sair */}
        <div
          className="p-3 flex flex-col gap-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}
        >
          <Link
            href="/perfil"
            aria-current={pathname.startsWith('/perfil') ? 'page' : undefined}
            className="nav-sidebar-item"
            data-active={pathname.startsWith('/perfil') ? 'true' : undefined}
          >
            <Icon name="PiUserCircleBold" size="md" color="light" />
            <Text as="span" size="sm" className="sidebar-rotulo font-medium text-white">
              Meu perfil
            </Text>
          </Link>
          <button
            type="button"
            onClick={handleSair}
            aria-label="Sair do sistema"
            className="nav-sidebar-item btn-sair"
            style={{ width: '100%', border: 'none', cursor: 'pointer' }}
          >
            <Icon name="PiSignOutBold" size="md" color="light" />
            <Text as="span" size="sm" className="sidebar-rotulo font-medium text-white">
              Sair
            </Text>
          </button>
        </div>
      </aside>
  );
}
