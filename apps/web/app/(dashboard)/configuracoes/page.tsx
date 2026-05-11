import { VStack, Heading, Text } from '@lojascem/components-react';
import { FormConfiguracao } from '@/components/configuracoes/FormConfiguracao';
import { acaoAtualizarConfiguracao, buscarConfiguracoes } from './actions';

export const dynamic = 'force-dynamic';

const ROTULOS: Record<string, { rotulo: string; descricao: string }> = {
  endereco_sede: {
    rotulo: 'Endereço da sede',
    descricao:
      'Endereço usado como origem em todas as viagens criadas. Alterar aqui afeta somente viagens novas — viagens existentes preservam o valor original.',
  },
};

export default async function PaginaConfiguracoes(): Promise<React.ReactElement> {
  const configuracoes = await buscarConfiguracoes();

  return (
    <VStack className="gap-6 mx-auto max-w-3xl">
      <VStack>
        <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
          Configurações
        </Heading>
        <Text size="sm" className="mt-1" style={{ color: 'var(--fo-text-secondary)' }}>
          Parâmetros gerais do sistema
        </Text>
      </VStack>

      <VStack className="gap-4">
        {configuracoes.map((c) => {
          const meta = ROTULOS[c.chave] ?? {
            rotulo: c.chave,
            descricao: 'Configuração sem descrição',
          };
          return (
            <FormConfiguracao
              key={c.chave}
              configuracao={c}
              rotulo={meta.rotulo}
              descricao={meta.descricao}
              acao={acaoAtualizarConfiguracao.bind(null, c.chave)}
            />
          );
        })}
      </VStack>
    </VStack>
  );
}
