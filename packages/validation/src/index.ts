import { z } from 'zod';

// ─── Campos Comuns ────────────────────────────────────────────────────────────

export const schemaMatricula = z
  .string()
  .length(10, 'Matrícula deve ter exatamente 10 dígitos')
  .regex(/^\d{10}$/, 'Matrícula deve conter apenas dígitos numéricos');

export const schemaUuid = z.string().uuid('ID inválido');

// ─── Autenticação ─────────────────────────────────────────────────────────────

export const schemaLogin = z.object({
  matricula: schemaMatricula,
  senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

export type EntradaLogin = z.infer<typeof schemaLogin>;

// ─── Usuários ─────────────────────────────────────────────────────────────────

const PERFIS_VALIDOS = ['admin', 'gerente', 'encarregado', 'operador', 'motorista'] as const;

export const schemaCriarUsuario = z
  .object({
    matricula: schemaMatricula,
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200),
    senha: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    perfil: z.enum(PERFIS_VALIDOS, { message: 'Perfil inválido' }),
    email: z.string().email('E-mail inválido').optional(),
    telefone: z.string().max(20).optional(),
    cnh: z.string().max(20).optional(),
    cnhValidade: z.string().date('Data de validade inválida').optional(),
    ativo: z.boolean().default(true),
  })
  .refine(
    (dados) => {
      if (dados.perfil === 'motorista') {
        return dados.cnh !== undefined && dados.cnhValidade !== undefined;
      }
      return true;
    },
    { message: 'CNH e validade da CNH são obrigatórios para motoristas', path: ['cnh'] },
  );

export type EntradaCriarUsuario = z.infer<typeof schemaCriarUsuario>;

// ─── Veículos ─────────────────────────────────────────────────────────────────

const SITUACOES_VEICULO = ['ativo', 'em_manutencao', 'inativo', 'baixado'] as const;

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
  anoFabricacao: z.number().int().min(ANO_MINIMO).max(anoAtual + 1),
  anoModelo: z.number().int().min(ANO_MINIMO).max(anoAtual + 2),
  cor: z.string().min(1).max(50),
  renavam: z
    .string()
    .length(11, 'RENAVAM deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'RENAVAM deve conter apenas dígitos'),
  odometroAtual: z.number().int().min(0, 'Odômetro não pode ser negativo'),
  dataAquisicao: z.string().date('Data de aquisição inválida'),
  situacao: z.enum(SITUACOES_VEICULO, { message: 'Situação inválida' }),
  observacoes: z.string().optional(),
});

export type EntradaCriarVeiculo = z.infer<typeof schemaCriarVeiculo>;

// ─── Viagens ──────────────────────────────────────────────────────────────────

export const schemaCriarViagem = z
  .object({
    destino: z.string().min(5, 'Destino deve ter no mínimo 5 caracteres').max(500),
    dataViagem: z.string().date('Data da viagem inválida'),
    horaInicioPrevista: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Hora de início deve estar no formato HH:MM'),
    horaFimPrevista: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Hora de fim deve estar no formato HH:MM'),
    motoristaId: schemaUuid,
    veiculoId: schemaUuid,
    solicitadoPor: z.string().min(3).max(200),
    autorizadoPor: z.string().min(3).max(200),
    observacoes: z.string().optional(),
  })
  .refine((dados) => dados.horaFimPrevista > dados.horaInicioPrevista, {
    message: 'Hora de fim deve ser posterior à hora de início',
    path: ['horaFimPrevista'],
  });

export type EntradaCriarViagem = z.infer<typeof schemaCriarViagem>;

export const schemaIniciarViagem = z.object({
  odometroInicial: z.number().int().min(0, 'Odômetro inicial não pode ser negativo'),
});

export type EntradaIniciarViagem = z.infer<typeof schemaIniciarViagem>;

export const schemaFinalizarViagem = z.object({
  odometroFinal: z.number().int().min(0, 'Odômetro final não pode ser negativo'),
});

export type EntradaFinalizarViagem = z.infer<typeof schemaFinalizarViagem>;
