'use client';

import { useState } from 'react';
import { TextField, Button, Alert, Card, HStack, VStack, Heading, Text } from '@lojascem/components-react';
import type { Configuracao } from '@/app/(dashboard)/configuracoes/actions';

type AcaoFormulario = (
  estadoAnterior: { erro?: string; sucesso?: boolean } | null,
  formData: FormData,
) => Promise<{ erro?: string; sucesso?: boolean } | null>;

interface FormConfiguracaoProps {
  configuracao: Configuracao;
  rotulo: string;
  descricao: string;
  acao: AcaoFormulario;
}

const ROTULOS_CHAVE: Record<string, string> = {
  endereco_sede: 'Endereço da sede',
};

export function FormConfiguracao({ configuracao, rotulo, descricao, acao }: FormConfiguracaoProps) {
  const [valor, setValor] = useState(configuracao.valor);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [pendente, setPendente] = useState(false);

  const alterado = valor.trim() !== configuracao.valor.trim();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);
    setPendente(true);
    const formData = new FormData();
    formData.set('valor', valor);
    const resultado = await acao(null, formData);
    setPendente(false);
    if (resultado?.erro) setErro(resultado.erro);
    else if (resultado?.sucesso) setSucesso(true);
  }

  function aoCancelar() {
    setValor(configuracao.valor);
    setErro(null);
    setSucesso(false);
  }

  return (
    <Card>
      <Card.Content>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <VStack gap={1}>
            <Heading size="md" weight="semibold" style={{ color: 'var(--fo-navy)' }}>
              {rotulo}
            </Heading>
            <Text size="sm" style={{ color: 'var(--fo-text-secondary)' }}>
              {descricao}
            </Text>
          </VStack>

          <TextField
            id={`config-${configuracao.chave}`}
            label="Valor"
            placeholder="Digite o novo valor..."
            value={valor}
            onChange={setValor}
            isBlock
            isRequired
            aria-required="true"
          />

          {erro && <Alert color="error">{erro}</Alert>}
          {sucesso && <Alert color="success">Configuração atualizada com sucesso.</Alert>}

          <HStack justifyContent="end" className="gap-3 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            {alterado && !pendente && (
              <Button type="button" variant="outline" color="default" onPress={aoCancelar}>
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              color="primary"
              isLoading={pendente}
              isDisabled={!alterado || pendente}
              leftIcon="PiCheckBold"
            >
              {pendente ? 'Salvando...' : 'Salvar'}
            </Button>
          </HStack>
        </form>
      </Card.Content>
    </Card>
  );
}

export { ROTULOS_CHAVE };
