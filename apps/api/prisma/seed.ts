import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Iniciando seed do banco de dados...');

  // Usuário administrador padrão
  const senhaAdminHash = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.usuario.upsert({
    where: { matricula: '0000000001' },
    update: {},
    create: {
      matricula: '0000000001',
      nome: 'Administrador',
      senhaHash: senhaAdminHash,
      perfil: 'admin',
      ativo: true,
    },
  });
  console.log(`Usuário admin criado: ${admin.matricula} — ${admin.nome}`);

  // Configuração do endereço da sede
  const sede = await prisma.configuracao.upsert({
    where: { chave: 'endereco_sede' },
    update: {},
    create: {
      chave: 'endereco_sede',
      valor: 'Rua da Sede, 1 — Centro, Brasília, DF',
    },
  });
  console.log(`Configuração criada: ${sede.chave} = ${sede.valor}`);

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
