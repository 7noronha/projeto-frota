'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from 'primereact/button';

const itensMenu = [
  { href: '/veiculos', rotulo: 'Veículos', icone: 'pi pi-car' },
  { href: '/viagens', rotulo: 'Viagens', icone: 'pi pi-map' },
  { href: '/usuarios', rotulo: 'Usuários', icone: 'pi pi-users' },
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
          <i className="pi pi-truck text-white" style={{ fontSize: '1rem' }} />
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
              <i className={item.icone} style={{ fontSize: '1rem', width: 20, textAlign: 'center' }} />
              <span className="text-sm font-medium">{item.rotulo}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sair */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Button
          label="Sair"
          icon="pi pi-sign-out"
          onClick={handleSair}
          className="w-full"
          severity="secondary"
          text
          style={{ color: 'rgba(255,255,255,0.65)', justifyContent: 'flex-start' }}
        />
      </div>
    </aside>
  );
}
