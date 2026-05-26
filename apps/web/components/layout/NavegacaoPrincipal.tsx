'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon, Text } from '@lojascem/components-react';

const itensMenu = [
  { href: '/dashboard', rotulo: 'Painel', icone: 'PiSquaresFourBold' as const },
  { href: '/alertas', rotulo: 'Alertas', icone: 'PiBellBold' as const },
  { href: '/veiculos', rotulo: 'Veículos', icone: 'PiCarBold' as const },
  { href: '/motoristas', rotulo: 'Motoristas', icone: 'PiUsersBold' as const },
  { href: '/viagens', rotulo: 'Viagens', icone: 'PiMapTrifoldBold' as const },
  { href: '/usuarios', rotulo: 'Usuários', icone: 'PiUserListBold' as const },
  { href: '/relatorios', rotulo: 'Relatórios', icone: 'PiChartBarBold' as const },
  { href: '/erd', rotulo: 'Diagrama ER', icone: 'PiTreeStructureBold' as const },
  { href: '/configuracoes', rotulo: 'Configurações', icone: 'PiGearBold' as const },
];

const LS_KEY = 'sidebar-colapsado';
const LARGURA_EXPANDIDA = 240;
const LARGURA_COLAPSADA = 72;

export function NavegacaoPrincipal() {
  const pathname = usePathname();
  const router = useRouter();
  const [colapsado, setColapsado] = useState(false);

  // Carrega preferência do localStorage no mount (SSR-safe)
  useEffect(() => {
    const salvo = window.localStorage.getItem(LS_KEY);
    if (salvo === 'true') setColapsado(true);
  }, []);

  function alternarColapso(): void {
    setColapsado((c) => {
      const novo = !c;
      window.localStorage.setItem(LS_KEY, String(novo));
      return novo;
    });
  }

  async function handleSair(): Promise<void> {
    await fetch('/api/auth/sair', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside
      aria-label="Navegação principal"
      className="flex h-screen flex-col"
      style={{
        width: colapsado ? LARGURA_COLAPSADA : LARGURA_EXPANDIDA,
        flexShrink: 0,
        background: '#0A2540',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        transition: 'width 180ms ease',
      }}
    >
      {/* Cabeçalho: logo + botão toggle */}
      <div
        className="flex items-center h-16"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
          padding: colapsado ? '0 12px' : '0 16px',
          gap: 12,
          justifyContent: colapsado ? 'center' : 'space-between',
        }}
      >
        {!colapsado && (
          <div className="flex items-center" style={{ gap: 10 }}>
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ background: '#0066FF', width: 32, height: 32, flexShrink: 0 }}
            >
              <Icon name="PiTruckBold" size="sm" color="light" />
            </div>
            <Text as="span" size="lg" className="font-bold text-white">
              FleetOps
            </Text>
          </div>
        )}
        <button
          type="button"
          onClick={alternarColapso}
          aria-label={colapsado ? 'Expandir menu' : 'Recolher menu'}
          aria-expanded={!colapsado}
          title={colapsado ? 'Expandir menu' : 'Recolher menu'}
          className="nav-toggle-btn"
        >
          <Icon
            name={colapsado ? 'PiCaretRightBold' : 'PiCaretLeftBold'}
            size="sm"
            color="light"
          />
        </button>
      </div>

      {/* Menu principal */}
      <nav aria-label="Menu" className="flex-1 overflow-y-auto py-4" style={{ paddingInline: 12 }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 4, listStyle: 'none', padding: 0, margin: 0 }}>
          {itensMenu.map((item) => {
            const ativo = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={ativo ? 'page' : undefined}
                  className="nav-sidebar-item"
                  data-active={ativo ? 'true' : undefined}
                  data-colapsado={colapsado ? 'true' : undefined}
                  title={colapsado ? item.rotulo : undefined}
                >
                  <span className="nav-icon" aria-hidden="true">
                    <Icon name={item.icone} size="md" color="light" />
                  </span>
                  {!colapsado && (
                    <span className="nav-label">{item.rotulo}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Perfil + Sair */}
      <div
        className="flex flex-col"
        style={{
          padding: 12,
          gap: 4,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <Link
          href="/perfil"
          aria-current={pathname.startsWith('/perfil') ? 'page' : undefined}
          className="nav-sidebar-item"
          data-active={pathname.startsWith('/perfil') ? 'true' : undefined}
          data-colapsado={colapsado ? 'true' : undefined}
          title={colapsado ? 'Meu perfil' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">
            <Icon name="PiUserCircleBold" size="md" color="light" />
          </span>
          {!colapsado && <span className="nav-label">Meu perfil</span>}
        </Link>
        <button
          type="button"
          onClick={handleSair}
          aria-label="Sair do sistema"
          title={colapsado ? 'Sair' : undefined}
          className="nav-sidebar-item btn-sair"
          data-colapsado={colapsado ? 'true' : undefined}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            font: 'inherit',
            textAlign: 'left',
          }}
        >
          <span className="nav-icon" aria-hidden="true">
            <Icon name="PiSignOutBold" size="md" color="light" />
          </span>
          {!colapsado && <span className="nav-label">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
