import { HStack, Toaster } from '@lojascem/components-react';
import { NavegacaoPrincipal } from '@/components/layout/NavegacaoPrincipal';

export default function LayoutDashboard({ children }: { children: React.ReactNode }) {
  return (
    <HStack className="h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Skip link — focado via Tab no início da página */}
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Pular para o conteúdo principal
      </a>
      <NavegacaoPrincipal />
      <main id="conteudo-principal" tabIndex={-1} className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
      <Toaster position="top-right" richColors closeButton />
    </HStack>
  );
}
