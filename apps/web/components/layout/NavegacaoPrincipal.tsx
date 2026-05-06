'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';

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
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {itensMenu.map((item) => {
          const ativo = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer"
                style={{
                  background: ativo ? '#0066FF' : 'transparent',
                  color: ativo ? '#ffffff' : 'rgba(255,255,255,0.65)',
                }}
                onMouseEnter={(e) => {
                  if (!ativo) {
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLDivElement).style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!ativo) {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.65)';
                  }
                }}
              >
                <i className={item.icone} style={{ fontSize: '1rem', width: 20, textAlign: 'center' }} />
                <span className="text-sm font-medium">{item.rotulo}</span>
              </div>
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
