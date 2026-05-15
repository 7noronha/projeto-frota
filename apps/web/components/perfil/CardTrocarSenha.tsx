'use client';

import { useState } from 'react';
import { TextField, Button, Alert, Card, HStack, Heading, Text } from '@lojascem/components-react';
import { acaoTrocarSenha } from '@/app/(dashboard)/perfil/actions';
import { notificar } from '@/lib/notificar';

export function CardTrocarSenha() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const podeSubmeter =
    senhaAtual.trim() !== '' && novaSenha.length >= 8 && novaSenha === confirmacao;

  function limpar() {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmacao('');
    setErro(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setPendente(true);
    const formData = new FormData();
    formData.set('senhaAtual', senhaAtual);
    formData.set('novaSenha', novaSenha);
    formData.set('confirmacao', confirmacao);
    const resultado = await acaoTrocarSenha(null, formData);
    setPendente(false);
    if (resultado?.erro) {
      setErro(resultado.erro);
      notificar.erro(resultado.erro);
    } else if (resultado?.sucesso) {
      notificar.sucesso('Senha alterada com sucesso.');
      limpar();
    }
  }

  return (
    <Card>
      <Card.Content>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Heading size="md" weight="semibold" style={{ color: 'var(--fo-navy)' }}>
              Trocar senha
            </Heading>
            <Text size="sm" style={{ color: 'var(--fo-text-secondary)' }}>
              Confirme sua senha atual antes de definir uma nova.
            </Text>
          </div>

          <TextField
            id="senhaAtual"
            label="Senha atual"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            isBlock
            isRequired
            value={senhaAtual}
            onChange={setSenhaAtual}
          />

          <div className="grid grid-cols-2 gap-4">
            <TextField
              id="novaSenha"
              label="Nova senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              isBlock
              isRequired
              value={novaSenha}
              onChange={setNovaSenha}
              isInvalid={novaSenha.length > 0 && novaSenha.length < 8}
              errorMessage={
                novaSenha.length > 0 && novaSenha.length < 8
                  ? 'Mínimo 8 caracteres'
                  : ''
              }
            />
            <TextField
              id="confirmacao"
              label="Confirmar nova senha"
              type="password"
              placeholder="Repita a nova senha"
              autoComplete="new-password"
              isBlock
              isRequired
              value={confirmacao}
              onChange={setConfirmacao}
              isInvalid={confirmacao.length > 0 && confirmacao !== novaSenha}
              errorMessage={
                confirmacao.length > 0 && confirmacao !== novaSenha
                  ? 'A confirmação não confere'
                  : ''
              }
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
            <Button
              type="submit"
              color="primary"
              leftIcon="PiLockKeyBold"
              isLoading={pendente}
              isDisabled={!podeSubmeter || pendente}
            >
              {pendente ? 'Alterando...' : 'Alterar senha'}
            </Button>
          </HStack>
        </form>
      </Card.Content>
    </Card>
  );
}
