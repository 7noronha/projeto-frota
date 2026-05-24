import { z } from 'zod';

// ─── Campos comuns ──────────────────────────────────────────────────────────

export const schemaMatricula = z
  .string()
  .length(10, 'Matrícula deve ter exatamente 10 dígitos')
  .regex(/^\d{10}$/, 'Matrícula deve conter apenas dígitos numéricos');

/** ID numérico (INT autoincrement) — substitui o antigo schemaUuid. */
export const schemaId = z.coerce.number().int().positive('ID inválido');

const REGEX_HORA_HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

// ─── Autenticação ───────────────────────────────────────────────────────────

export const schemaLogin = z.object({
  matricula: schemaMatricula,
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});
export type EntradaLogin = z.infer<typeof schemaLogin>;

// ─── Usuários ───────────────────────────────────────────────────────────────

export const schemaCriarUsuario = z
  .object({
    matricula: schemaMatricula,
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200),
    senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    perfil_id: schemaId,
    email: z.string().email('E-mail inválido').optional(),
    telefone: z.string().max(20).optional(),
    cnh: z.string().max(20).optional(),
    cnh_validade: z.string().date('Data de validade inválida').optional(),
    ativo: z.boolean().default(true),
  });
export type EntradaCriarUsuario = z.infer<typeof schemaCriarUsuario>;

// ─── Veículos ───────────────────────────────────────────────────────────────

const ANO_MINIMO = 1900;
const anoAtual = new Date().getFullYear();

export const schemaCriarVeiculo = z.object({
  placa: z
    .string()
    .regex(
      /^[A-Z]{3}\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/,
      'Placa inválida (formato antigo: ABC1234 ou Mercosul: ABC1D23)',
    ),
  marca: z.string().min(1).max(80),
  modelo: z.string().min(1).max(100),
  ano_fabricacao: z.number().int().min(ANO_MINIMO).max(anoAtual + 1),
  ano_modelo: z.number().int().min(ANO_MINIMO).max(anoAtual + 2),
  cor: z.string().min(1).max(50),
  renavam: z
    .string()
    .length(11, 'RENAVAM deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'RENAVAM deve conter apenas dígitos'),
  odometro_atual: z.number().int().min(0, 'Odômetro não pode ser negativo'),
  data_aquisicao: z.string().date('Data de aquisição inválida'),
  situacao_id: schemaId,
  observacoes: z.string().optional(),
});
export type EntradaCriarVeiculo = z.infer<typeof schemaCriarVeiculo>;

// ─── Viagens ────────────────────────────────────────────────────────────────

export const schemaCamposViagem = z.object({
  destino: z.string().min(1, 'Informe o destino').max(500),
  data_viagem: z.string().date('Data da viagem inválida'),
  hora_inicio_prevista: z.string().regex(REGEX_HORA_HHMM, 'Hora de início inválida (HH:MM)'),
  hora_fim_prevista: z.string().regex(REGEX_HORA_HHMM, 'Hora de fim inválida (HH:MM)'),
  motorista_id: schemaId,
  veiculo_id: schemaId,
  solicitado_por: z.string().min(3, 'Solicitado por deve ter no mínimo 3 caracteres').max(200),
  autorizado_por: z.string().min(3, 'Autorizado por deve ter no mínimo 3 caracteres').max(200),
  observacoes: z.string().optional(),
});

export const schemaCriarViagem = schemaCamposViagem.refine(
  (d) => d.hora_fim_prevista > d.hora_inicio_prevista,
  { message: 'Hora de fim deve ser posterior à hora de início', path: ['hora_fim_prevista'] },
);
export type EntradaCriarViagem = z.infer<typeof schemaCriarViagem>;

export const schemaAtualizarViagem = schemaCamposViagem.partial();
export type EntradaAtualizarViagem = z.infer<typeof schemaAtualizarViagem>;

export const schemaIniciarViagem = z.object({
  odometro_inicial: z.number().int().min(0, 'Odômetro inicial não pode ser negativo'),
});
export type EntradaIniciarViagem = z.infer<typeof schemaIniciarViagem>;

export const schemaFinalizarViagem = z.object({
  odometro_final: z.number().int().min(0, 'Odômetro final não pode ser negativo'),
});
export type EntradaFinalizarViagem = z.infer<typeof schemaFinalizarViagem>;
