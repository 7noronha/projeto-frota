import { NavegacaoPrincipal } from '@/components/layout/NavegacaoPrincipal';

export default function LayoutDashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8fafc' }}>
      <NavegacaoPrincipal />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
