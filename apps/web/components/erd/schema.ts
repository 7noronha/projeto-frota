// Definição declarativa do schema FleetOps para renderização ERD.
// Mantida em sincronia com apps/api/prisma/schema.prisma.

export type Categoria = 'lookup' | 'entidade' | 'despesa' | 'config';

export interface Coluna {
  name: string;
  type: string;
  pk?: boolean;
  fk?: string; // formato "tabela.coluna"
  uk?: boolean;
}

export interface TabelaErd {
  id: string;
  label: string;
  categoria: Categoria;
  cascade?: boolean;
  x: number;
  y: number;
  cols: Coluna[];
}

// ─── Schema completo ─────────────────────────────────────────────────────────

export const TABELAS: TabelaErd[] = [
  // ── 9 Lookups (linha superior) ──
  { id: 'perfis_usuario', label: 'perfis_usuario', categoria: 'lookup', x: 40, y: 40,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'nome', type: 'string', uk: true },
      { name: 'descricao', type: 'string?' },
    ]
  },
  { id: 'situacoes_veiculo', label: 'situacoes_veiculo', categoria: 'lookup', x: 360, y: 40,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'nome', type: 'string', uk: true },
      { name: 'descricao', type: 'string?' },
    ]
  },
  { id: 'status_viagem', label: 'status_viagem', categoria: 'lookup', x: 680, y: 40,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'nome', type: 'string', uk: true },
      { name: 'descricao', type: 'string?' },
    ]
  },
  { id: 'tipos_combustivel', label: 'tipos_combustivel', categoria: 'lookup', x: 1000, y: 40,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'nome', type: 'string', uk: true },
      { name: 'descricao', type: 'string?' },
    ]
  },
  { id: 'tipos_manutencao', label: 'tipos_manutencao', categoria: 'lookup', x: 1320, y: 40,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'nome', type: 'string', uk: true },
      { name: 'descricao', type: 'string?' },
    ]
  },
  { id: 'gravidades_multa', label: 'gravidades_multa', categoria: 'lookup', x: 1640, y: 40,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'nome', type: 'string', uk: true },
      { name: 'pontos_padrao', type: 'int' },
    ]
  },
  { id: 'tipos_imposto', label: 'tipos_imposto', categoria: 'lookup', x: 1960, y: 40,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'nome', type: 'string', uk: true },
      { name: 'descricao', type: 'string?' },
    ]
  },
  { id: 'tipos_cobertura_seguro', label: 'tipos_cobertura_seguro', categoria: 'lookup', x: 2280, y: 40,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'nome', type: 'string', uk: true },
      { name: 'descricao', type: 'string?' },
    ]
  },
  { id: 'tipos_documento_veiculo', label: 'tipos_documento_veiculo', categoria: 'lookup', x: 2600, y: 40,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'nome', type: 'string', uk: true },
      { name: 'descricao', type: 'string?' },
    ]
  },

  // ── Entidades principais (linha do meio) ──
  { id: 'usuarios', label: 'usuarios', categoria: 'entidade', x: 200, y: 280,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'matricula', type: 'string', uk: true },
      { name: 'nome', type: 'string' },
      { name: 'senha_hash', type: 'string' },
      { name: 'perfil_id', type: 'int', fk: 'perfis_usuario.id' },
      { name: 'email', type: 'string?' },
      { name: 'telefone', type: 'string?' },
      { name: 'cnh', type: 'string?' },
      { name: 'cnh_validade', type: 'date?' },
      { name: 'ativo', type: 'bool' },
      { name: 'expo_push_token', type: 'string?' },
      { name: 'data_hora_criacao', type: 'timestamp' },
      { name: 'data_hora_atualizacao', type: 'timestamp' },
      { name: 'data_hora_exclusao', type: 'timestamp?' },
    ]
  },
  { id: 'veiculos', label: 'veiculos', categoria: 'entidade', x: 1340, y: 280,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'placa', type: 'string', uk: true },
      { name: 'marca', type: 'string' },
      { name: 'modelo', type: 'string' },
      { name: 'ano_fabricacao', type: 'int' },
      { name: 'ano_modelo', type: 'int' },
      { name: 'cor', type: 'string' },
      { name: 'renavam', type: 'string', uk: true },
      { name: 'odometro_atual', type: 'int' },
      { name: 'data_aquisicao', type: 'date' },
      { name: 'situacao_id', type: 'int', fk: 'situacoes_veiculo.id' },
      { name: 'observacoes', type: 'string?' },
      { name: 'data_hora_criacao', type: 'timestamp' },
      { name: 'data_hora_atualizacao', type: 'timestamp' },
      { name: 'data_hora_exclusao', type: 'timestamp?' },
    ]
  },

  // ── Viagens (centro-baixo) ──
  { id: 'viagens', label: 'viagens', categoria: 'entidade', x: 720, y: 760,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'origem', type: 'string' },
      { name: 'destino', type: 'string' },
      { name: 'origem_latitude', type: 'decimal?' },
      { name: 'origem_longitude', type: 'decimal?' },
      { name: 'destino_latitude', type: 'decimal?' },
      { name: 'destino_longitude', type: 'decimal?' },
      { name: 'rota_geometria', type: 'jsonb?' },
      { name: 'rota_distancia_km', type: 'decimal?' },
      { name: 'rota_duracao_min', type: 'int?' },
      { name: 'data_viagem', type: 'date' },
      { name: 'hora_inicio_prevista', type: 'time' },
      { name: 'hora_fim_prevista', type: 'time' },
      { name: 'data_hora_inicio_real', type: 'timestamp?' },
      { name: 'data_hora_fim_real', type: 'timestamp?' },
      { name: 'odometro_inicial', type: 'int?' },
      { name: 'odometro_final', type: 'int?' },
      { name: 'distancia_percorrida', type: 'int?' },
      { name: 'motorista_id', type: 'int', fk: 'usuarios.id' },
      { name: 'veiculo_id', type: 'int', fk: 'veiculos.id' },
      { name: 'operador_criador_id', type: 'int', fk: 'usuarios.id' },
      { name: 'solicitado_por', type: 'string' },
      { name: 'autorizado_por', type: 'string' },
      { name: 'status_id', type: 'int', fk: 'status_viagem.id' },
      { name: 'observacoes', type: 'string?' },
      { name: 'data_hora_criacao', type: 'timestamp' },
      { name: 'data_hora_atualizacao', type: 'timestamp' },
      { name: 'data_hora_exclusao', type: 'timestamp?' },
    ]
  },
  { id: 'posicoes_viagem', label: 'posicoes_viagem', categoria: 'entidade', cascade: true, x: 1700, y: 760,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'viagem_id', type: 'int', fk: 'viagens.id' },
      { name: 'latitude', type: 'decimal' },
      { name: 'longitude', type: 'decimal' },
      { name: 'precisao_m', type: 'decimal?' },
      { name: 'capturado_em', type: 'timestamp' },
      { name: 'data_hora_criacao', type: 'timestamp' },
    ]
  },

  // ── 6 Despesas (linha inferior, alinhadas com lookups acima) ──
  { id: 'abastecimentos', label: 'abastecimentos', categoria: 'despesa', x: 1000, y: 1500,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'veiculo_id', type: 'int', fk: 'veiculos.id' },
      { name: 'tipo_combustivel_id', type: 'int', fk: 'tipos_combustivel.id' },
      { name: 'data', type: 'date' },
      { name: 'valor', type: 'decimal' },
      { name: 'descricao', type: 'string' },
      { name: 'litros', type: 'decimal' },
      { name: 'preco_litro', type: 'decimal' },
      { name: 'odometro', type: 'int?' },
      { name: 'observacoes', type: 'string?' },
      { name: 'data_hora_criacao', type: 'timestamp' },
      { name: 'data_hora_exclusao', type: 'timestamp?' },
    ]
  },
  { id: 'manutencoes', label: 'manutencoes', categoria: 'despesa', x: 1320, y: 1500,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'veiculo_id', type: 'int', fk: 'veiculos.id' },
      { name: 'tipo_manutencao_id', type: 'int', fk: 'tipos_manutencao.id' },
      { name: 'data', type: 'date' },
      { name: 'valor', type: 'decimal' },
      { name: 'descricao', type: 'string' },
      { name: 'oficina', type: 'string?' },
      { name: 'odometro', type: 'int?' },
      { name: 'observacoes', type: 'string?' },
      { name: 'data_hora_criacao', type: 'timestamp' },
      { name: 'data_hora_exclusao', type: 'timestamp?' },
    ]
  },
  { id: 'multas', label: 'multas', categoria: 'despesa', x: 1640, y: 1500,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'veiculo_id', type: 'int', fk: 'veiculos.id' },
      { name: 'gravidade_multa_id', type: 'int', fk: 'gravidades_multa.id' },
      { name: 'data', type: 'date' },
      { name: 'valor', type: 'decimal' },
      { name: 'descricao', type: 'string' },
      { name: 'numero_auto', type: 'string?' },
      { name: 'pontos_cnh', type: 'int?' },
      { name: 'data_vencimento', type: 'date?' },
      { name: 'observacoes', type: 'string?' },
      { name: 'data_hora_criacao', type: 'timestamp' },
      { name: 'data_hora_exclusao', type: 'timestamp?' },
    ]
  },
  { id: 'impostos', label: 'impostos', categoria: 'despesa', x: 1960, y: 1500,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'veiculo_id', type: 'int', fk: 'veiculos.id' },
      { name: 'tipo_imposto_id', type: 'int', fk: 'tipos_imposto.id' },
      { name: 'data', type: 'date' },
      { name: 'valor', type: 'decimal' },
      { name: 'descricao', type: 'string' },
      { name: 'ano_exercicio', type: 'int' },
      { name: 'numero_parcela', type: 'int?' },
      { name: 'total_parcelas', type: 'int?' },
      { name: 'data_vencimento', type: 'date?' },
      { name: 'observacoes', type: 'string?' },
      { name: 'data_hora_criacao', type: 'timestamp' },
      { name: 'data_hora_exclusao', type: 'timestamp?' },
    ]
  },
  { id: 'seguros', label: 'seguros', categoria: 'despesa', x: 2280, y: 1500,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'veiculo_id', type: 'int', fk: 'veiculos.id' },
      { name: 'tipo_cobertura_seguro_id', type: 'int', fk: 'tipos_cobertura_seguro.id' },
      { name: 'data', type: 'date' },
      { name: 'valor', type: 'decimal' },
      { name: 'descricao', type: 'string' },
      { name: 'seguradora', type: 'string' },
      { name: 'numero_apolice', type: 'string?' },
      { name: 'vigencia_inicio', type: 'date' },
      { name: 'vigencia_fim', type: 'date' },
      { name: 'observacoes', type: 'string?' },
      { name: 'data_hora_criacao', type: 'timestamp' },
      { name: 'data_hora_exclusao', type: 'timestamp?' },
    ]
  },
  { id: 'documentacoes', label: 'documentacoes', categoria: 'despesa', x: 2600, y: 1500,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'veiculo_id', type: 'int', fk: 'veiculos.id' },
      { name: 'tipo_documento_veiculo_id', type: 'int', fk: 'tipos_documento_veiculo.id' },
      { name: 'data', type: 'date' },
      { name: 'valor', type: 'decimal' },
      { name: 'descricao', type: 'string' },
      { name: 'data_vencimento', type: 'date?' },
      { name: 'observacoes', type: 'string?' },
      { name: 'data_hora_criacao', type: 'timestamp' },
      { name: 'data_hora_exclusao', type: 'timestamp?' },
    ]
  },

  // ── Auditoria ──
  { id: 'impostos_historicos', label: 'impostos_historicos', categoria: 'despesa', cascade: true, x: 1960, y: 2080,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'imposto_id', type: 'int', fk: 'impostos.id' },
      { name: 'campo', type: 'string' },
      { name: 'valor_anterior', type: 'string?' },
      { name: 'valor_novo', type: 'string?' },
      { name: 'alterado_por', type: 'int?' },
      { name: 'data_hora_alteracao', type: 'timestamp' },
    ]
  },

  // ── Config ──
  { id: 'configuracoes', label: 'configuracoes', categoria: 'config', x: 40, y: 1500,
    cols: [
      { name: 'id', type: 'int', pk: true },
      { name: 'chave', type: 'string', uk: true },
      { name: 'valor', type: 'string' },
      { name: 'data_hora_atualizacao', type: 'timestamp' },
    ]
  },
];
