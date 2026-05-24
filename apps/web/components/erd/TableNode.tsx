'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Coluna, Categoria } from './schema';

export interface TableNodeData {
  label: string;
  categoria: Categoria;
  cascade?: boolean;
  cols: Coluna[];
  destaque?: 'origem' | 'destino' | null;
  [key: string]: unknown;
}

const ESTILO_CATEGORIA: Record<Categoria, { borda: string; cabeçalho: string; fundo: string }> = {
  lookup:   { borda: '#c7d2fe', cabeçalho: '#4338ca', fundo: '#fafbff' },
  entidade: { borda: '#cbd5e1', cabeçalho: '#0a2540', fundo: '#ffffff' },
  despesa:  { borda: '#fcd9c1', cabeçalho: '#ea580c', fundo: '#fffaf5' },
  config:   { borda: '#bbf7d0', cabeçalho: '#047857', fundo: '#f0fdf7' },
};

export function TableNode({ data, selected }: NodeProps) {
  const td = data as TableNodeData;
  const estilo = ESTILO_CATEGORIA[td.categoria];

  return (
    <div
      style={{
        background: estilo.fundo,
        border: `1.5px solid ${selected ? '#0066ff' : estilo.borda}`,
        borderRadius: 10,
        boxShadow: selected ? '0 0 0 4px rgba(0,102,255,0.15)' : '0 2px 6px rgba(10,37,64,0.06)',
        fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
        fontSize: 11,
        minWidth: 260,
        overflow: 'hidden',
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          background: estilo.cabeçalho,
          color: 'white',
          padding: '8px 12px',
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: 0.3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{td.label}</span>
        {td.cascade && (
          <span
            style={{
              fontSize: 9,
              opacity: 0.9,
              fontWeight: 600,
              background: 'rgba(255,255,255,0.2)',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            cascade
          </span>
        )}
      </div>

      {/* Colunas */}
      <div>
        {td.cols.map((c) => {
          const badges: { texto: string; cor: string }[] = [];
          if (c.pk) badges.push({ texto: 'PK', cor: '#16a34a' });
          if (c.fk) badges.push({ texto: 'FK', cor: '#0066ff' });
          if (c.uk) badges.push({ texto: 'UK', cor: '#d97706' });

          return (
            <div
              key={c.name}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 8,
                padding: '4px 12px',
                borderBottom: '1px solid #f1f5f9',
                position: 'relative',
                alignItems: 'center',
                borderLeft: c.fk ? '2px solid #0066ff' : '2px solid transparent',
              }}
            >
              <span style={{ color: '#0a2540', fontWeight: 500 }}>{c.name}</span>
              <span style={{ color: '#64748b', fontSize: 10 }}>{c.type}</span>
              <span style={{ display: 'flex', gap: 3 }}>
                {badges.map((b) => (
                  <span
                    key={b.texto}
                    style={{
                      background: b.cor,
                      color: 'white',
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: 3,
                      letterSpacing: 0.5,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {b.texto}
                  </span>
                ))}
              </span>

              {/* Handles invisíveis ancorados na linha — um em cada lado.
                  Edges escolhem o lado mais curto via sourceHandle/targetHandle. */}
              <Handle
                type="source"
                position={Position.Left}
                id={`${c.name}-left-source`}
                style={{ background: 'transparent', border: 'none', width: 6, height: 6 }}
                isConnectable={false}
              />
              <Handle
                type="target"
                position={Position.Left}
                id={`${c.name}-left-target`}
                style={{ background: 'transparent', border: 'none', width: 6, height: 6 }}
                isConnectable={false}
              />
              <Handle
                type="source"
                position={Position.Right}
                id={`${c.name}-right-source`}
                style={{ background: 'transparent', border: 'none', width: 6, height: 6 }}
                isConnectable={false}
              />
              <Handle
                type="target"
                position={Position.Right}
                id={`${c.name}-right-target`}
                style={{ background: 'transparent', border: 'none', width: 6, height: 6 }}
                isConnectable={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
