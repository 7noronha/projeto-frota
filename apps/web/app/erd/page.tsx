import type { Metadata } from 'next';
import { ErdDiagram } from '@/components/erd/ErdDiagram';

export const metadata: Metadata = {
  title: 'Diagrama ER — FleetOps',
  description: 'Diagrama entidade-relacionamento do banco de dados FleetOps (22 tabelas, snake_case, INT IDs).',
};

// Rota pública, sem auth — documentação técnica.
export default function PaginaErd() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #0a2540 0%, #0047b3 100%)',
          color: 'white',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(10,37,64,0.15)',
          zIndex: 10,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>
            FleetOps — Diagrama ER
          </h1>
          <p style={{ margin: '2px 0 0 0', fontSize: 12, opacity: 0.85 }}>
            22 tabelas · snake_case · INT autoincrement · soft delete · America/Sao_Paulo
          </p>
        </div>

        <div style={{ display: 'flex', gap: 24, fontSize: 12, alignItems: 'center' }}>
          <Legenda cor="#4338ca" label="lookup (9)" />
          <Legenda cor="#0a2540" label="entidade (4)" />
          <Legenda cor="#ea580c" label="despesa (7)" />
          <Legenda cor="#047857" label="config (1)" />
          <div style={{ marginLeft: 16, opacity: 0.7, fontSize: 11 }}>
            Linhas conectam <strong style={{ color: '#00c2ff' }}>FK → PK</strong> direto na coluna
          </div>
        </div>
      </header>

      {/* React Flow ocupa o resto da tela */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ErdDiagram />
      </div>
    </div>
  );
}

function Legenda({ cor, label }: { cor: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          background: cor,
          display: 'inline-block',
        }}
      />
      <span style={{ opacity: 0.9 }}>{label}</span>
    </span>
  );
}
