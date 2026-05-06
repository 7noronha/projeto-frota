// ─── Perfis de Usuário ───────────────────────────────────────────────────────

export type Perfil = 'admin' | 'gerente' | 'encarregado' | 'operador' | 'motorista';

// ─── Status de Viagem ────────────────────────────────────────────────────────

export type StatusViagem = 'CRIADA' | 'EM_ANDAMENTO' | 'FINALIZADA';

// ─── Situação de Veículo ─────────────────────────────────────────────────────

export type SituacaoVeiculo = 'ativo' | 'em_manutencao' | 'inativo' | 'baixado';

// ─── Payload do JWT ──────────────────────────────────────────────────────────

export interface UsuarioJwt {
  sub: string;
  matricula: string;
  nome: string;
  perfil: Perfil;
  iat: number;
  exp: number;
}

// ─── Resposta de Autenticação ─────────────────────────────────────────────────

export interface RespostaLogin {
  token: string;
  usuario: {
    id: string;
    matricula: string;
    nome: string;
    perfil: Perfil;
  };
}

// ─── Paginação ────────────────────────────────────────────────────────────────

export interface RespostaPaginada<T> {
  dados: T[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalPaginas: number;
}

// ─── Respostas de Usuário ─────────────────────────────────────────────────────

export interface UsuarioResposta {
  id: string;
  matricula: string;
  nome: string;
  perfil: Perfil;
  email: string | null;
  telefone: string | null;
  cnh: string | null;
  cnhValidade: string | null;
  ativo: boolean;
  dataCriacao: string;
}

// ─── Respostas de Veículo ─────────────────────────────────────────────────────

export interface VeiculoResposta {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  renavam: string;
  odometroAtual: number;
  dataAquisicao: string;
  situacao: SituacaoVeiculo;
  observacoes: string | null;
  dataCriacao: string;
}

// ─── Respostas de Viagem ──────────────────────────────────────────────────────

export interface ViagemResposta {
  id: string;
  origem: string;
  destino: string;
  dataViagem: string;
  horaInicioPrevista: string;
  horaFimPrevista: string;
  dataHoraInicioReal: string | null;
  dataHoraFimReal: string | null;
  odometroInicial: number | null;
  odometroFinal: number | null;
  distanciaPercorrida: number | null;
  motoristaId: string;
  veiculoId: string;
  operadorCriadorId: string;
  solicitadoPor: string;
  autorizadoPor: string;
  observacoes: string | null;
  status: StatusViagem;
  dataCriacao: string;
}

// ViagemDetalhada inclui dados de motorista e veículo (retornado pela API via include)
export interface ViagemDetalhada extends ViagemResposta {
  motorista: {
    id: string;
    nome: string;
    matricula: string;
  };
  veiculo: {
    id: string;
    placa: string;
    marca: string;
    modelo: string;
    odometroAtual: number;
  };
}
