/**
 * Seed do FleetOps (schema snake_case + INT IDs).
 *
 * Popula tabelas de lookup (perfis, situações, status, tipos), cria
 * usuário admin padrão e configuração endereco_sede.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERFIS = [
  { nome: 'admin', descricao: 'Acesso total ao sistema' },
  { nome: 'gerente', descricao: 'Gestão tática (reservado)' },
  { nome: 'encarregado', descricao: 'Coordenação de turno (reservado)' },
  { nome: 'operador', descricao: 'Operador de logística' },
  { nome: 'motorista', descricao: 'Motorista da frota' },
];

const SITUACOES_VEICULO = [
  { nome: 'ativo', descricao: 'Disponível para uso' },
  { nome: 'em_manutencao', descricao: 'Em manutenção, fora de operação' },
  { nome: 'inativo', descricao: 'Temporariamente indisponível' },
  { nome: 'baixado', descricao: 'Removido da frota' },
];

const STATUS_VIAGEM = [
  { nome: 'CRIADA', descricao: 'Viagem agendada, ainda não iniciada' },
  { nome: 'EM_ANDAMENTO', descricao: 'Motorista em rota' },
  { nome: 'FINALIZADA', descricao: 'Viagem concluída' },
];

const TIPOS_COMBUSTIVEL = [
  { nome: 'gasolina' },
  { nome: 'etanol' },
  { nome: 'diesel' },
  { nome: 'gnv' },
  { nome: 'flex' },
];

const TIPOS_MANUTENCAO = [
  { nome: 'preventiva', descricao: 'Manutenção agendada/preventiva' },
  { nome: 'corretiva', descricao: 'Correção de falha/quebra' },
];

const GRAVIDADES_MULTA = [
  { nome: 'leve', pontos_padrao: 3 },
  { nome: 'media', pontos_padrao: 4 },
  { nome: 'grave', pontos_padrao: 5 },
  { nome: 'gravissima', pontos_padrao: 7 },
];

const TIPOS_IMPOSTO = [
  { nome: 'ipva' },
  { nome: 'licenciamento' },
  { nome: 'dpvat' },
  { nome: 'outro' },
];

const TIPOS_COBERTURA_SEGURO = [
  { nome: 'total', descricao: 'Cobertura compreensiva' },
  { nome: 'terceiros', descricao: 'Apenas terceiros' },
  { nome: 'compreensiva', descricao: 'Compreensiva ampliada' },
];

const TIPOS_DOCUMENTO_VEICULO = [
  { nome: 'crlv' },
  { nome: 'transferencia' },
  { nome: 'vistoria' },
  { nome: 'emplacamento' },
  { nome: 'outro' },
];

async function popularLookup<T extends { nome: string }>(
  modelo: { upsert: (args: { where: { nome: string }; update: object; create: T }) => Promise<unknown> },
  itens: T[],
): Promise<void> {
  for (const item of itens) {
    await modelo.upsert({
      where: { nome: item.nome },
      update: item,
      create: item,
    });
  }
}

async function main(): Promise<void> {
  console.log('Seed: populando tabelas de lookup…');

  await popularLookup(prisma.perfis_usuario, PERFIS);
  await popularLookup(prisma.situacoes_veiculo, SITUACOES_VEICULO);
  await popularLookup(prisma.status_viagem, STATUS_VIAGEM);
  await popularLookup(prisma.tipos_combustivel, TIPOS_COMBUSTIVEL);
  await popularLookup(prisma.tipos_manutencao, TIPOS_MANUTENCAO);
  await popularLookup(prisma.gravidades_multa, GRAVIDADES_MULTA);
  await popularLookup(prisma.tipos_imposto, TIPOS_IMPOSTO);
  await popularLookup(prisma.tipos_cobertura_seguro, TIPOS_COBERTURA_SEGURO);
  await popularLookup(prisma.tipos_documento_veiculo, TIPOS_DOCUMENTO_VEICULO);

  console.log('Seed: criando usuário admin (matrícula 0000000001)…');
  const perfilAdmin = await prisma.perfis_usuario.findUniqueOrThrow({ where: { nome: 'admin' } });

  const senhaAdminHash = await bcrypt.hash('Admin@123456', 10);
  await prisma.usuarios.upsert({
    where: { matricula: '0000000001' },
    update: { perfil_id: perfilAdmin.id },
    create: {
      matricula: '0000000001',
      nome: 'Administrador',
      senha_hash: senhaAdminHash,
      perfil_id: perfilAdmin.id,
      ativo: true,
    },
  });

  console.log('Seed: configuração endereco_sede…');
  await prisma.configuracoes.upsert({
    where: { chave: 'endereco_sede' },
    update: {},
    create: {
      chave: 'endereco_sede',
      valor: 'Rodovia Engenheiro Ermenio de Oliveira Penteado, SP-75, Salto, SP',
    },
  });

  console.log('Seed concluído com sucesso.');
}

main()
  .catch((erro) => {
    console.error('Erro ao executar seed:', erro);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
