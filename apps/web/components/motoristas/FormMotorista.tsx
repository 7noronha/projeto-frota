'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TextField, Button, Alert, Card, HStack, Heading, ComboBox, ListBox } from '@lojascem/components-react';
import type { UsuarioResposta } from '@fleetops/types';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormMotoristaProps {
  acao: AcaoFormulario;
  motoristaInicial?: UsuarioResposta;
  titulo: string;
}

interface ErrosCampos {
  matricula?: string;
  nome?: string;
  senha?: string;
  cnh?: string;
  cnhValidade?: string;
}

function naoVazio(valor: string, rotulo: string): string {
  return valor.trim() ? '' : `Informe ${rotulo.toLowerCase()}`;
}

export function FormMotorista({ acao, motoristaInicial, titulo }: FormMotoristaProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  const ehEdicao = Boolean(motoristaInicial);

  const [matricula, setMatricula] = useState(motoristaInicial?.matricula ?? '');
  const [nome, setNome] = useState(motoristaInicial?.nome ?? '');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState(motoristaInicial?.telefone ?? '');
  const [cnh, setCnh] = useState(motoristaInicial?.cnh ?? '');
  const [cnhValidade, setCnhValidade] = useState(motoristaInicial?.cnhValidade ?? '');
  const [ativo, setAtivo] = useState<boolean>(motoristaInicial?.ativo ?? true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setPendente(true);

    const formData = new FormData();
    formData.set('matricula', matricula);
    formData.set('nome', nome);
    if (senha.trim()) formData.set('senha', senha);
    if (telefone.trim()) formData.set('telefone', telefone);
    formData.set('cnh', cnh);
    formData.set('cnhValidade', cnhValidade);
    formData.set('ativo', String(ativo));

    const resultado = await acao(null, formData);
    setPendente(false);
    if (resultado?.erro) setErro(resultado.erro);
  }

  function erroBlur(campo: keyof ErrosCampos, valor: string, rotulo: string) {
    setTocados((p) => ({ ...p, [campo]: true }));
    setErros((p) => ({ ...p, [campo]: naoVazio(valor, rotulo) }));
  }

  function erroCampo(campo: keyof ErrosCampos) {
    return tocados[campo] ? (erros[campo] ?? '') : '';
  }

  return (
    <div className="mx-auto max-w-2xl">
      <HStack alignItems="center" justifyContent="between" className="mb-6">
        <Heading size="xl" weight="bold" style={{ color: 'var(--fo-navy)' }}>
          {titulo}
        </Heading>
        <Link href="/motoristas" className="text-sm text-[var(--fo-text-secondary)]" style={{ textDecoration: 'none' }}>
          ← Voltar
        </Link>
      </HStack>

      <Card>
        <Card.Content>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Matrícula + Status (edição) */}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                id="matricula"
                label="Matrícula"
                placeholder="0009003656"
                maxLength={10}
                value={matricula}
                onChange={(v) => setMatricula(v.replace(/\D/g, ''))}
                isDisabled={ehEdicao}
                isRequired
                isInvalid={Boolean(erroCampo('matricula'))}
                errorMessage={erroCampo('matricula')}
                aria-required="true"
                onBlur={() => !ehEdicao && erroBlur('matricula', matricula, 'a matrícula')}
              />
              {ehEdicao && (
                <ComboBox
                  label="Status"
                  selectedKey={String(ativo)}
                  onSelectionChange={(chave) => setAtivo(chave === 'true')}
                >
                  <ListBox.Item key="true">Ativo</ListBox.Item>
                  <ListBox.Item key="false">Inativo</ListBox.Item>
                </ComboBox>
              )}
            </div>

            {/* Nome */}
            <TextField
              id="nome"
              label="Nome completo"
              placeholder="JOÃO DA SILVA"
              value={nome}
              onChange={(v) => setNome(v)}
              isRequired
              isInvalid={Boolean(erroCampo('nome'))}
              errorMessage={erroCampo('nome')}
              aria-required="true"
              onBlur={() => erroBlur('nome', nome, 'o nome')}
            />

            {/* Senha */}
            <TextField
              id="senha"
              label={ehEdicao ? 'Nova senha (deixe em branco para não alterar)' : 'Senha'}
              type="password"
              placeholder={ehEdicao ? '••••••••' : 'Mínimo 8 caracteres'}
              value={senha}
              onChange={(v) => setSenha(v)}
              isRequired={!ehEdicao}
              isInvalid={Boolean(erroCampo('senha'))}
              errorMessage={erroCampo('senha')}
              aria-required={!ehEdicao ? 'true' : 'false'}
              onBlur={() => {
                if (!ehEdicao) erroBlur('senha', senha, 'a senha');
              }}
            />

            {/* Telefone */}
            <TextField
              id="telefone"
              label="Telefone"
              placeholder="(61) 99999-0000"
              value={telefone ?? ''}
              onChange={(v) => setTelefone(v)}
            />

            {/* CNH + Validade */}
            <div className="flex flex-col gap-1">
              <div
                className="rounded-md px-4 py-2 text-sm font-medium"
                style={{ background: '#EFF6FF', color: '#1D4ED8', borderLeft: '3px solid #3B82F6' }}
              >
                CNH obrigatória para motoristas
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField
                id="cnh"
                label="Número da CNH"
                placeholder="12345678901"
                value={cnh ?? ''}
                onChange={(v) => setCnh(v.replace(/\D/g, ''))}
                isRequired
                isInvalid={Boolean(erroCampo('cnh'))}
                errorMessage={erroCampo('cnh')}
                aria-required="true"
                onBlur={() => erroBlur('cnh', cnh ?? '', 'a CNH')}
              />
              <TextField
                id="cnhValidade"
                label="Validade da CNH"
                type="date"
                value={cnhValidade ?? ''}
                onChange={(v) => setCnhValidade(v)}
                isRequired
                isInvalid={Boolean(erroCampo('cnhValidade'))}
                errorMessage={erroCampo('cnhValidade')}
                aria-required="true"
                onBlur={() => erroBlur('cnhValidade', cnhValidade ?? '', 'a validade da CNH')}
              />
            </div>

            {erro && <Alert color="error">{erro}</Alert>}

            <HStack justifyContent="end" className="gap-3 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <Link href="/motoristas" style={{ textDecoration: 'none' }}>
                <Button variant="outline" color="default" type="button">Cancelar</Button>
              </Link>
              <Button
                type="submit"
                color="primary"
                isLoading={pendente}
                leftIcon="PiCheckBold"
              >
                {pendente ? 'Salvando...' : ehEdicao ? 'Salvar alterações' : 'Cadastrar motorista'}
              </Button>
            </HStack>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
