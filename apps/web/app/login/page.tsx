import { Icon, VStack, HStack, Text, Heading } from '@lojascem/components-react';
import { FormularioLogin } from './FormularioLogin';
import { IlustracaoAuth } from './IlustracaoAuth';

export default function PaginaLogin() {
  return (
    <VStack className="min-h-screen" style={{ background: '#f0f5ff' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav
        className="px-8 py-4"
        style={{ background: 'white', borderBottom: '1px solid #e8edf5' }}
      >
        <HStack alignItems="center" justifyContent="between">
          <HStack alignItems="center" className="gap-[10px]">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 34, height: 34, background: '#0066FF' }}
            >
              <Icon name="PiTruckBold" size="sm" color="light" />
            </div>
            <Text as="span" size="lg" className="font-bold tracking-tight" style={{ color: '#0A2540' }}>
              FleetOps
            </Text>
          </HStack>

          <a
            href="#"
            className="text-sm font-semibold"
            style={{ color: '#0066FF', textDecoration: 'none' }}
          >
            Precisa de ajuda?
          </a>
        </HStack>
      </nav>

      {/* ── Corpo principal ─────────────────────────────────────────────────── */}
      <main className="flex flex-1 items-center justify-center px-6 py-10 gap-8 lg:gap-16">

        {/* Ilustração — apenas em telas grandes */}
        <div className="hidden lg:flex flex-col items-center gap-6" style={{ flex: '0 0 auto', maxWidth: 480 }}>
          <IlustracaoAuth />

          <div className="text-center">
            <Text size="sm" className="font-medium" style={{ color: '#64748b' }}>
              Mais de{' '}
              <span className="font-bold" style={{ color: '#0066FF' }}>500 veículos</span>
              {' '}monitorados em tempo real
            </Text>
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
          <HStack alignItems="center" className="lg:hidden mb-6 gap-[10px]">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 32, height: 32, background: '#0066FF' }}
            >
              <Icon name="PiTruckBold" size="sm" color="light" />
            </div>
            <Text as="span" size="md" className="font-bold" style={{ color: '#0A2540' }}>FleetOps</Text>
          </HStack>

          {/* Cabeçalho */}
          <Heading size="xl" weight="bold" className="mb-1" style={{ color: '#0A2540' }}>
            Bem-vindo de volta
          </Heading>
          <Text size="sm" className="mb-8" style={{ color: '#94a3b8' }}>
            Entre com sua matrícula e senha para continuar.
          </Text>

          {/* Formulário */}
          <FormularioLogin />

          {/* Divisor */}
          <HStack alignItems="center" gap={4} className="my-6">
            <div className="flex-1" style={{ height: 1, background: '#e8edf5' }} />
            <Text as="span" size="xs" className="font-medium" style={{ color: '#94a3b8' }}>acesso corporativo</Text>
            <div className="flex-1" style={{ height: 1, background: '#e8edf5' }} />
          </HStack>

          {/* Info de acesso */}
          <HStack alignItems="start" className="gap-3 rounded-xl p-4" style={{ background: '#f0f5ff', border: '1px solid #dbeafe' }}>
            <Icon name="PiInfoBold" size="md" color="primary" />
            <Text size="xs" className="leading-relaxed" style={{ color: '#475569' }}>
              Acesso restrito a colaboradores autorizados. Em caso de dúvidas sobre sua matrícula ou senha, contate o administrador do sistema.
            </Text>
          </HStack>
        </div>
      </main>

      {/* ── Rodapé ──────────────────────────────────────────────────────────── */}
      <footer className="text-center py-4">
        <Text size="xs" style={{ color: '#94a3b8' }}>
          © {new Date().getFullYear()} FleetOps — Todos os direitos reservados
        </Text>
      </footer>
    </VStack>
  );
}
