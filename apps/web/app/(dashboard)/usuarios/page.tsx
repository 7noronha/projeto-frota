import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, HStack, VStack, Heading, Text } from '@lojascem/components-react';
import { TabelaUsuarios } from '@/components/usuarios/TabelaUsuarios';
import { FiltrosUsuarios } from '@/components/usuarios/FiltrosUsuarios';
import { buscarUsuarios } from './actions';
import { Paginacao } from '@/components/Paginacao';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Usuários — FleetOps' };

interface PaginaUsuariosProps {
  searchParams: Promise<{ pagina?: string; nome?: string; perfil?: string; ativo?: string }>;
}

export default async function PaginaUsuarios({ searchParams }: PaginaUsuariosProps) {
  const params = await searchParams;
  const pagina = Number(params.pagina ?? 1);

  const { dados, total, totalPaginas } = await buscarUsuarios(pagina, {
    nome: params.nome,
    perfil: params.perfil,
    ativo: params.ativo,
  });

  return (
    <div>
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <VStack>
          <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
            Usuários
          </Heading>
          <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
            {total} {total === 1 ? 'usuário encontrado' : 'usuários encontrados'}
          </Text>
        </VStack>
        <Link href="/usuarios/novo" style={{ textDecoration: 'none' }}>
          <Button color="primary" leftIcon="PiPlusBold">
            Cadastrar usuário
          </Button>
        </Link>
      </HStack>

      <FiltrosUsuarios
        nomeInicial={params.nome ?? ''}
        perfilInicial={params.perfil ?? ''}
        ativoInicial={params.ativo ?? ''}
      />

      <TabelaUsuarios usuarios={dados} />

      <Paginacao
        totalPaginas={totalPaginas}
        paginaAtual={pagina}
        baseHref="/usuarios"
        params={{ nome: params.nome, perfil: params.perfil, ativo: params.ativo }}
      />
    </div>
  );
}
