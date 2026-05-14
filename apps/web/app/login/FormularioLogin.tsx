'use client';

import { useActionState, useState } from 'react';
import { acaoLogin } from './actions';
import { TextField, Button, Alert, Text } from '@lojascem/components-react';
import { schemaLogin } from '@fleetops/validation';
import { validar } from '@/lib/validar';

interface ErrosCampos {
  matricula?: string;
  senha?: string;
}

function validarCampoZod(campo: 'matricula' | 'senha', valor: string): string {
  // Valida apenas o campo isoladamente — pega a 1ª mensagem do schema relacionada
  const resultado = schemaLogin.safeParse({
    matricula: campo === 'matricula' ? valor : '0000000000',
    senha: campo === 'senha' ? valor : '00000000',
  });
  if (resultado.success) return '';
  const issue = resultado.error.issues.find((i) => i.path[0] === campo);
  return issue?.message ?? '';
}

export function FormularioLogin() {
  const [estado, acao, pendente] = useActionState(acaoLogin, null);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);

  function marcarTocado(campo: string) {
    setTocados((prev) => ({ ...prev, [campo]: true }));
  }

  function validarCampo(campo: keyof ErrosCampos, valor: string) {
    setErros((prev) => ({ ...prev, [campo]: validarCampoZod(campo, valor) }));
  }

  function aoSubmeter(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const entrada = {
      matricula: String(formData.get('matricula') ?? ''),
      senha: String(formData.get('senha') ?? ''),
    };
    const resultado = validar(schemaLogin, entrada);
    if (!resultado.sucesso) {
      e.preventDefault();
      setErros({
        matricula: resultado.erros.matricula,
        senha: resultado.erros.senha,
      });
      setTocados({ matricula: true, senha: true });
      setErroFormulario(resultado.erros._form ?? null);
    }
  }

  const erroMatricula = tocados.matricula ? erros.matricula : '';
  const erroSenha = tocados.senha ? erros.senha : '';

  return (
    <form action={acao} onSubmit={aoSubmeter} className="flex flex-col gap-4">

      {/* Matrícula */}
      <TextField
        id="matricula"
        name="matricula"
        label="Matrícula"
        placeholder="Digite sua matrícula"
        maxLength={10}
        autoComplete="username"
        isBlock
        isRequired
        isInvalid={Boolean(erroMatricula)}
        errorMessage={erroMatricula}
        leftIcon="PiIdentificationCardBold"
        aria-required="true"
        onBlur={(e) => {
          marcarTocado('matricula');
          validarCampo('matricula', (e.target as HTMLInputElement).value);
        }}
      />

      {/* Senha */}
      <TextField
        id="senha"
        name="senha"
        label="Senha"
        placeholder="Digite sua senha"
        type="password"
        autoComplete="current-password"
        isBlock
        isRequired
        isInvalid={Boolean(erroSenha)}
        errorMessage={erroSenha}
        leftIcon="PiLockBold"
        aria-required="true"
        onBlur={(e) => {
          marcarTocado('senha');
          validarCampo('senha', (e.target as HTMLInputElement).value);
        }}
      />

      {/* Erro do servidor ou de validação geral */}
      {(estado?.erro || erroFormulario) && (
        <Alert color="error">{estado?.erro ?? erroFormulario}</Alert>
      )}

      {/* Botão */}
      <Button
        type="submit"
        color="primary"
        isBlock
        isLoading={pendente}
        className="btn-pill h-11 text-[0.95rem]"
      >
        {pendente ? 'Entrando…' : 'Entrar'}
      </Button>

      {/* Esqueceu a senha */}
      <Text size="sm" className="text-center" style={{ color: '#94a3b8' }}>
        Esqueceu o acesso?{' '}
        <a
          href="#"
          className="font-semibold"
          style={{ color: '#0066FF', textDecoration: 'none' }}
          onClick={(e) => e.preventDefault()}
        >
          Contate o TI
        </a>
      </Text>
    </form>
  );
}
