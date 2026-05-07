import { Icon } from '@minha-empresa/components-react';
import { FormularioLogin } from './FormularioLogin';
import { IlustracaoAuth } from './IlustracaoAuth';

export default function PaginaLogin() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f5ff' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav
        className="flex items-center justify-between px-8 py-4"
        style={{ background: 'white', borderBottom: '1px solid #e8edf5' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 34, height: 34, background: '#0066FF' }}
          >
            <Icon name="PiTruckBold" size="sm" color="light" />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: '#0A2540' }}>
            FleetOps
          </span>
        </div>

        <a
          href="#"
          className="text-sm font-semibold"
          style={{ color: '#0066FF', textDecoration: 'none' }}
        >
          Precisa de ajuda?
        </a>
      </nav>

      {/* ── Corpo principal ─────────────────────────────────────────────────── */}
      <main className="flex flex-1 items-center justify-center px-6 py-10 gap-8 lg:gap-16">

        {/* Ilustração — apenas em telas grandes */}
        <div className="hidden lg:flex flex-col items-center gap-6" style={{ flex: '0 0 auto', maxWidth: 480 }}>
          <IlustracaoAuth />

          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>
              Mais de{' '}
              <span className="font-bold" style={{ color: '#0066FF' }}>500 veículos</span>
              {' '}monitorados em tempo real
            </p>
          </div>
        </div>

        {/* Card de login ─────────────────────────────────────────────────────── */}
        <div
          className="w-full"
          style={{
            maxWidth: 420,
            background: 'white',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(0, 50, 120, 0.10)',
            padding: '40px 40px 36px',
          }}
        >
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 32, height: 32, background: '#0066FF' }}
            >
              <Icon name="PiTruckBold" size="sm" color="light" />
            </div>
            <span className="text-base font-bold" style={{ color: '#0A2540' }}>FleetOps</span>
          </div>

          {/* Cabeçalho */}
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0A2540' }}>
            Bem-vindo de volta
          </h1>
          <p className="text-sm mb-8" style={{ color: '#94a3b8' }}>
            Entre com sua matrícula e senha para continuar.
          </p>

          {/* Formulário */}
          <FormularioLogin />

          {/* Divisor */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1" style={{ height: 1, background: '#e8edf5' }} />
            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>acesso corporativo</span>
            <div className="flex-1" style={{ height: 1, background: '#e8edf5' }} />
          </div>

          {/* Info de acesso */}
          <div
            className="flex items-start gap-3 rounded-xl p-4"
            style={{ background: '#f0f5ff', border: '1px solid #dbeafe' }}
          >
            <Icon name="PiInfoBold" size="md" color="primary" />
            <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
              Acesso restrito a colaboradores autorizados. Em caso de dúvidas sobre sua matrícula ou senha, contate o administrador do sistema.
            </p>
          </div>
        </div>
      </main>

      {/* ── Rodapé ──────────────────────────────────────────────────────────── */}
      <footer className="text-center py-4">
        <p className="text-xs" style={{ color: '#94a3b8' }}>
          © {new Date().getFullYear()} FleetOps — Todos os direitos reservados
        </p>
      </footer>
    </div>
  );
}
