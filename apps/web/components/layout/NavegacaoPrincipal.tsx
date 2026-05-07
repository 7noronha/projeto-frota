'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Icon } from '@minha-empresa/components-react';

const itensMenu = [
  { href: '/veiculos', rotulo: 'Veículos', icone: 'PiCarBold' as const },
  { href: '/viagens', rotulo: 'Viagens', icone: 'PiMapBold' as const },
  { href: '/usuarios', rotulo: 'Usuários', icone: 'PiUsersBold' as const },
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
      <div
        className="flex h-16 items-center gap-3 px-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ background: '#0066FF', width: 32, height: 32 }}
        >
          <Icon name="PiTruckBold" size="sm" color="light" />
        </div>
        <span className="text-xl font-bold text-white">FleetOps</span>
      </div>

      {/* Menu */}
      <nav aria-label="Menu" className="flex-1 px-3 py-4 flex flex-col gap-2">
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
              <Icon name={item.icone} size="md" />
              <span className="text-sm font-medium">{item.rotulo}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sair */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Button
          variant="ghost"
          color="default"
          isBlock
          leftIcon="PiSignOutBold"
          onClick={handleSair}
          className="justify-start"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Sair
        </Button>
      </div>
    </aside>
  );
}
