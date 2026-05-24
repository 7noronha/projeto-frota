'use client';

import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  BackgroundVariant,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TableNode } from './TableNode';
import { TABELAS, type TabelaErd } from './schema';

const NODE_TYPES = { table: TableNode };

const COR_CATEGORIA = {
  lookup: '#c7d2fe',
  entidade: '#cbd5e1',
  despesa: '#fcd9c1',
  config: '#bbf7d0',
} as const;

export function ErdDiagram() {
  // Constrói nodes a partir do schema
  const initialNodes: Node[] = useMemo(
    () =>
      TABELAS.map((t: TabelaErd) => ({
        id: t.id,
        type: 'table',
        position: { x: t.x, y: t.y },
        data: {
          label: t.label,
          categoria: t.categoria,
          cascade: t.cascade,
          cols: t.cols,
        },
        draggable: true,
      })),
    [],
  );

  // Constrói edges a partir das FKs declaradas em cada coluna
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    const tabelaPorId = new Map(TABELAS.map((t) => [t.id, t]));

    TABELAS.forEach((tabela) => {
      tabela.cols.forEach((col) => {
        if (!col.fk) return;
        const [refTabelaId, refColName] = col.fk.split('.');
        const refTabela = tabelaPorId.get(refTabelaId);
        if (!refTabela) return;

        // Escolhe os lados (left/right) baseado nas posições x —
        // origem mais à esquerda conecta no lado direito da origem
        // e no lado esquerdo da PK destino.
        const origemMaisEsquerda = tabela.x < refTabela.x;
        const sourceHandle = origemMaisEsquerda
          ? `${col.name}-right-source`
          : `${col.name}-left-source`;
        const targetHandle = origemMaisEsquerda
          ? `${refColName}-left-target`
          : `${refColName}-right-target`;

        edges.push({
          id: `${tabela.id}.${col.name}-${refTabelaId}.${refColName}`,
          source: tabela.id,
          target: refTabelaId,
          sourceHandle,
          targetHandle,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#0066ff', strokeWidth: 1.6, opacity: 0.7 },
          markerEnd: {
            type: 'arrowclosed' as never,
            color: '#0066ff',
            width: 14,
            height: 14,
          },
          label: '',
        });
      });
    });

    return edges;
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={NODE_TYPES}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        fitView
        fitViewOptions={{ padding: 0.1, maxZoom: 0.9 }}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#cbd5e1" />
        <Controls position="bottom-right" />
        <MiniMap
          position="bottom-left"
          nodeColor={(node) => {
            const cat = (node.data as { categoria?: keyof typeof COR_CATEGORIA }).categoria;
            return (cat && COR_CATEGORIA[cat]) || '#cbd5e1';
          }}
          nodeStrokeWidth={2}
          pannable
          zoomable
          style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}
