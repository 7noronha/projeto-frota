'use client';

import { useState } from 'react';
import { TextField, Button, Alert, Card, HStack, Heading, Text } from '@lojascem/components-react';
import { acaoAtualizarDadosPessoais } from '@/app/(dashboard)/perfil/actions';
import { notificar } from '@/lib/notificar';
import type { UsuarioResposta } from '@fleetops/types';

interface CardDadosPessoaisProps {
  usuario: UsuarioResposta;
}

export function CardDadosPessoais({ usuario }: CardDadosPessoaisProps) {
  const [email, setEmail] = useState(usuario.email ?? '');
  const [telefone, setTelefone] = useState(usuario.telefone ?? '');
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const alterado =
    (email.trim() || '') !== (usuario.email ?? '') ||
    (telefone.trim() || '') !== (usuario.telefone ?? '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setPendente(true);
    const formData = new FormData();
    formData.set('email', email);
    formData.set('telefone', telefone);
    const resultado = await acaoAtualizarDadosPessoais(null, formData);
    setPendente(false);
    if (resultado?.erro) {
      setErro(resultado.erro);
      notificar.erro(resultado.erro);
    } else if (resultado?.sucesso) {
      notificar.sucesso('Dados atualizados com sucesso.');
    }
  }

  function aoCancelar() {
    setEmail(usuario.email ?? '');
    setTelefone(usuario.telefone ?? '');
    setErro(null);
  }

  return (
    <Card>
      <Card.Content>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Heading size="md" weight="semibold" style={{ color: 'var(--fo-navy)' }}>
              Dados pessoais
            </Heading>
            <Text size="sm" style={{ color: 'var(--fo-text-secondary)' }}>
              E-mail e telefone podem ser atualizados a qualquer momento.
              Para alterar matrícula, nome ou perfil, contate o administrador.
            </Text>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              id="email"
              label="E-mail"
              type="email"
              placeholder="usuario@empresa.com"
              isBlock
              value={email}
              onChange={setEmail}
            />
            <TextField
              id="telefone"
              label="Telefone"
              placeholder="(61) 99999-0000"
              isBlock
              value={telefone}
              onChange={setTelefone}
            />
          </div>

          {erro && (
            <div role="alert" aria-live="polite">
              <Alert color="error">{erro}</Alert>
            </div>
          )}

          <HStack
            justifyContent="end"
            className="gap-3 pt-3"
            style={{ borderTop: '1px solid #f1f5f9' }}
          >
            {alterado && !pendente && (
              <Button type="button" variant="outline" color="default" onPress={aoCancelar}>
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              color="primary"
              leftIcon="PiCheckBold"
              isLoading={pendente}
              isDisabled={!alterado || pendente}
            >
              {pendente ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </HStack>
        </form>
      </Card.Content>
    </Card>
  );
}
