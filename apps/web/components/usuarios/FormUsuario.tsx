'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TextField,
  Button,
  Alert,
  Card,
  HStack,
  Heading,
  SelectField,
  ListBox,
} from '@lojascem/components-react';
import type { UsuarioResposta } from '@fleetops/types';

type AcaoFormulario = (
  estadoAnterior: { erro?: string } | null,
  formData: FormData,
) => Promise<{ erro?: string } | null>;

interface FormUsuarioProps {
  acao: AcaoFormulario;
  usuarioInicial?: UsuarioResposta;
  titulo: string;
}

interface ErrosCampos {
  matricula?: string;
  nome?: string;
  senha?: string;
  perfil?: string;
  cnh?: string;
  cnh_validade?: string;
}

const PERFIS = [
  { valor: 'admin', rotulo: 'Administrador' },
  { valor: 'gerente', rotulo: 'Gerente' },
  { valor: 'encarregado', rotulo: 'Encarregado' },
  { valor: 'operador', rotulo: 'Operador' },
  { valor: 'motorista', rotulo: 'Motorista' },
];

function naoVazio(valor: string, rotulo: string): string {
  return valor.trim() ? '' : `Informe ${rotulo.toLowerCase()}`;
}

export function FormUsuario({ acao, usuarioInicial, titulo }: FormUsuarioProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});

  const ehEdicao = Boolean(usuarioInicial);

  const [matricula, setMatricula] = useState(usuarioInicial?.matricula ?? '');
  const [nome, setNome] = useState(usuarioInicial?.nome ?? '');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState<string>(usuarioInicial?.perfil?.nome ?? 'operador');
  const [email, setEmail] = useState(usuarioInicial?.email ?? '');
  const [telefone, setTelefone] = useState(usuarioInicial?.telefone ?? '');
  const [cnh, setCnh] = useState(usuarioInicial?.cnh ?? '');
  const [cnh_validade, setCnhValidade] = useState(usuarioInicial?.cnh_validade ?? '');
  const [ativo, setAtivo] = useState<boolean>(usuarioInicial?.ativo ?? true);

  const ehMotorista = perfil === 'motorista';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setPendente(true);

    const formData = new FormData();
    formData.set('matricula', matricula);
    formData.set('nome', nome);
    formData.set('perfil', perfil);
    if (senha.trim()) formData.set('senha', senha);
    if (email.trim()) formData.set('email', email);
    if (telefone.trim()) formData.set('telefone', telefone);
    if (cnh.trim()) formData.set('cnh', cnh);
    if (cnh_validade.trim()) formData.set('cnh_validade', cnh_validade);
    if (ehEdicao) formData.set('ativo', String(ativo));

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
        <Link
          href="/usuarios"
          className="text-sm text-[var(--fo-text-secondary)]"
          style={{ textDecoration: 'none' }}
        >
          ← Voltar
        </Link>
      </HStack>

      <Card>
        <Card.Content>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              <SelectField
                label="Perfil"
                isBlock
                isRequired
                aria-required="true"
                value={perfil}
                onChange={(v) => {
                  if (typeof v === 'string') setPerfil(v);
                }}
              >
                {PERFIS.map((p) => (
                  <ListBox.Item key={p.valor}>{p.rotulo}</ListBox.Item>
                ))}
              </SelectField>
            </div>

            <TextField
              id="nome"
              label="Nome completo"
              placeholder="JOÃO DA SILVA"
              value={nome}
              onChange={setNome}
              isRequired
              isInvalid={Boolean(erroCampo('nome'))}
              errorMessage={erroCampo('nome')}
              aria-required="true"
              onBlur={() => erroBlur('nome', nome, 'o nome')}
            />

            <TextField
              id="senha"
              label={ehEdicao ? 'Nova senha (deixe em branco para não alterar)' : 'Senha'}
              type="password"
              placeholder={ehEdicao ? '••••••••' : 'Mínimo 8 caracteres'}
              value={senha}
              onChange={setSenha}
              isRequired={!ehEdicao}
              isInvalid={Boolean(erroCampo('senha'))}
              errorMessage={erroCampo('senha')}
              aria-required={!ehEdicao ? 'true' : 'false'}
              onBlur={() => {
                if (!ehEdicao) erroBlur('senha', senha, 'a senha');
              }}
            />

            <div className="grid grid-cols-2 gap-4">
              <TextField
                id="email"
                label="E-mail (opcional)"
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={setEmail}
              />
              <TextField
                id="telefone"
                label="Telefone (opcional)"
                placeholder="(61) 99999-0000"
                value={telefone}
                onChange={setTelefone}
              />
            </div>

            {ehMotorista && (
              <>
                <div
                  className="rounded-md px-4 py-2 text-sm font-medium"
                  style={{
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    borderLeft: '3px solid #3B82F6',
                  }}
                >
                  CNH obrigatória para motoristas
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    id="cnh"
                    label="Número da CNH"
                    placeholder="12345678901"
                    value={cnh}
                    onChange={(v) => setCnh(v.replace(/\D/g, ''))}
                    isRequired={ehMotorista}
                    isInvalid={Boolean(erroCampo('cnh'))}
                    errorMessage={erroCampo('cnh')}
                    aria-required={ehMotorista ? 'true' : 'false'}
                    onBlur={() => ehMotorista && erroBlur('cnh', cnh, 'a CNH')}
                  />
                  <TextField
                    id="cnh_validade"
                    label="Validade da CNH"
                    type="date"
                    value={cnh_validade}
                    onChange={setCnhValidade}
                    isRequired={ehMotorista}
                    isInvalid={Boolean(erroCampo('cnh_validade'))}
                    errorMessage={erroCampo('cnh_validade')}
                    aria-required={ehMotorista ? 'true' : 'false'}
                    onBlur={() =>
                      ehMotorista && erroBlur('cnh_validade', cnh_validade, 'a validade da CNH')
                    }
                  />
                </div>
              </>
            )}

            {ehEdicao && (
              <SelectField
                label="Status"
                isBlock
                value={String(ativo)}
                onChange={(v) => setAtivo(v === 'true')}
              >
                <ListBox.Item key="true">Ativo</ListBox.Item>
                <ListBox.Item key="false">Inativo</ListBox.Item>
              </SelectField>
            )}

            {erro && <Alert color="error">{erro}</Alert>}

            <HStack
              justifyContent="end"
              className="gap-3 pt-4"
              style={{ borderTop: '1px solid #f1f5f9' }}
            >
              <Link href="/usuarios" style={{ textDecoration: 'none' }}>
                <Button variant="outline" color="default" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                color="primary"
                isLoading={pendente}
                leftIcon="PiCheckBold"
              >
                {pendente
                  ? 'Salvando...'
                  : ehEdicao
                    ? 'Salvar alterações'
                    : 'Cadastrar usuário'}
              </Button>
            </HStack>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
