// ────────────────────────────────────────────────────────────────────────────
// FleetOps — Tipos compartilhados (schema snake_case + INT IDs).
// ────────────────────────────────────────────────────────────────────────────

// ─── Payload do JWT ─────────────────────────────────────────────────────────

export interface UsuarioJwt {
  sub: number; // INT ID
  matricula: string;
  nome: string;
  perfil: string; // nome do perfil ("admin", "motorista", etc.)
  iat: number;
  exp: number;
}

// ─── Resposta de Autenticação ────────────────────────────────────────────────

export interface RespostaLogin {
  token: string;
  usuario: {
    id: number;
    matricula: string;
    nome: string;
    perfil: string;
  };
}

// ─── Paginação ───────────────────────────────────────────────────────────────

export interface RespostaPaginada<T> {
  dados: T[];
  total: number;
  pagina: number;
  tamanho_pagina: number;
  total_paginas: number;
}

// ─── Lookups (tipos auxiliares) ──────────────────────────────────────────────

export interface ItemLookup {
  id: number;
  nome: string;
  descricao: string | null;
}

// ─── Usuários ────────────────────────────────────────────────────────────────

export interface UsuarioResposta {
  id: number;
  matricula: string;
  nome: string;
  perfil_id: number;
  perfil: ItemLookup;
  email: string | null;
  telefone: string | null;
  cnh: string | null;
  cnh_validade: string | null;
  ativo: boolean;
  data_hora_criacao: string;
}

// ─── Veículos ────────────────────────────────────────────────────────────────

export interface VeiculoResposta {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  ano_modelo: number;
  cor: string;
  renavam: string;
  odometro_atual: number;
  data_aquisicao: string;
  situacao_id: number;
  situacao: ItemLookup;
  observacoes: string | null;
  data_hora_criacao: string;
}

// ─── Viagens ─────────────────────────────────────────────────────────────────

export interface ViagemResposta {
  id: number;
  origem: string;
  destino: string;
  origem_latitude: number | null;
  origem_longitude: number | null;
  destino_latitude: number | null;
  destino_longitude: number | null;
  rota_geometria: unknown | null;
  rota_distancia_km: number | null;
  rota_duracao_min: number | null;
  velocidade_media_km_h: number | null;
  data_viagem: string;
  hora_inicio_prevista: string;
  hora_fim_prevista: string;
  data_hora_inicio_real: string | null;
  data_hora_fim_real: string | null;
  odometro_inicial: number | null;
  odometro_final: number | null;
  distancia_percorrida: number | null;
  motorista_id: number;
  veiculo_id: number;
  operador_criador_id: number;
  solicitado_por: string;
  autorizado_por: string;
  observacoes: string | null;
  status_id: number;
  data_hora_criacao: string;
}

export interface ViagemDetalhada extends ViagemResposta {
  motorista: { id: number; nome: string; matricula: string };
  veiculo: { id: number; placa: string; marca: string; modelo: string; odometro_atual: number };
  status: ItemLookup;
}

// ─── Despesas (1 tipo por subtabela) ─────────────────────────────────────────

interface DespesaBase {
  id: number;
  veiculo_id: number;
  data: string;
  valor: number;
  descricao: string;
  observacoes: string | null;
  data_hora_criacao: string;
}

export interface MultaResposta extends DespesaBase {
  gravidade_multa_id: number;
  gravidade: ItemLookup;
  numero_auto: string | null;
  pontos_cnh: number | null;
  data_vencimento: string | null;
}

export interface AbastecimentoResposta extends DespesaBase {
  tipo_combustivel_id: number;
  tipo_combustivel: ItemLookup;
  litros: number;
  preco_litro: number;
  odometro: number | null;
}

export interface ManutencaoResposta extends DespesaBase {
  tipo_manutencao_id: number;
  tipo_manutencao: ItemLookup;
  oficina: string | null;
  odometro: number | null;
}

export interface ImpostoResposta extends DespesaBase {
  tipo_imposto_id: number;
  tipo_imposto: ItemLookup;
  ano_exercicio: number;
  numero_parcela: number | null;
  total_parcelas: number | null;
  data_vencimento: string | null;
}

export interface SeguroResposta extends DespesaBase {
  tipo_cobertura_seguro_id: number;
  tipo_cobertura: ItemLookup;
  seguradora: string;
  numero_apolice: string | null;
  vigencia_inicio: string;
  vigencia_fim: string;
}

export interface DocumentacaoResposta extends DespesaBase {
  tipo_documento_veiculo_id: number;
  tipo_documento: ItemLookup;
  data_vencimento: string | null;
}
