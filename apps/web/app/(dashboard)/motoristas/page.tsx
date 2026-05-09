import Link from 'next/link';
import { Button, HStack, VStack, Heading, Text } from '@lojascem/components-react';
import { TabelaMotoristas } from '@/components/motoristas/TabelaMotoristas';
import { buscarMotoristas } from './actions';
import { Paginacao } from '@/components/Paginacao';

export const dynamic = 'force-dynamic';

interface PaginaMotoristasProps {
  searchParams: Promise<{ pagina?: string; nome?: string; ativo?: string }>;
}

export default async function PaginaMotoristas({ searchParams }: PaginaMotoristasProps) {
  const params = await searchParams;
  const pagina = Number(params.pagina ?? 1);

  const { dados, total, totalPaginas } = await buscarMotoristas(pagina, {
    nome: params.nome,
    ativo: params.ativo,
  });

  return (
    <div>
      {/* Cabeçalho */}
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <VStack>
          <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
            Motoristas
          </Heading>
          <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
            {total} {total === 1 ? 'motorista encontrado' : 'motoristas encontrados'}
          </Text>
        </VStack>
        <Link href="/motoristas/novo" style={{ textDecoration: 'none' }}>
          <Button color="primary" leftIcon="PiPlusBold">Cadastrar motorista</Button>
        </Link>
      </HStack>

      {/* Filtros */}
      <form method="GET" className="mb-6 flex flex-wrap gap-3 items-end">
        <input
          name="nome"
          defaultValue={params.nome ?? ''}
          placeholder="Buscar por nome ou matrícula..."
          className="rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ borderColor: '#d1d5db', height: '34px', color: '#111827', minWidth: '260px' }}
        />

        <select
          name="ativo"
          defaultValue={params.ativo ?? ''}
          className="rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ borderColor: '#d1d5db', height: '34px', color: '#111827' }}
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>

        <Button type="submit" variant="outline" color="default" size="sm">
          Filtrar
        </Button>

        {(params.nome || params.ativo) && (
          <Link href="/motoristas" className="text-sm" style={{ color: '#64748b' }}>
            Limpar filtros
          </Link>
        )}
      </form>

      {/* Tabela */}
      <TabelaMotoristas motoristas={dados} />

      {/* Paginação */}
      <Paginacao
        totalPaginas={totalPaginas}
        paginaAtual={pagina}
        baseHref="/motoristas"
        params={{ nome: params.nome, ativo: params.ativo }}
      />
    </div>
  );
}
