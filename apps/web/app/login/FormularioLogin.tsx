'use client';

import { useActionState, useState } from 'react';
import { acaoLogin } from './actions';
import { TextField, Button, Alert, Icon, VStack, Text } from '@minha-empresa/components-react';

interface ErrosCampos {
  matricula?: string;
  senha?: string;
}

function validarMatricula(valor: string): string {
  if (!valor.trim()) return 'Informe sua matrícula';
  if (valor.trim().length < 4) return 'Matrícula inválida';
  return '';
}

function validarSenha(valor: string): string {
  if (!valor) return 'Informe sua senha';
  if (valor.length < 4) return 'Senha muito curta';
  return '';
}

export function FormularioLogin() {
  const [estado, acao, pendente] = useActionState(acaoLogin, null);
  const [erros, setErros] = useState<ErrosCampos>({});
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  function marcarTocado(campo: string) {
    setTocados((prev) => ({ ...prev, [campo]: true }));
  }

  function validarCampo(campo: keyof ErrosCampos, valor: string) {
    const msg = campo === 'matricula' ? validarMatricula(valor) : validarSenha(valor);
    setErros((prev) => ({ ...prev, [campo]: msg }));
  }

  const erroMatricula = tocados.matricula ? erros.matricula : '';
  const erroSenha = tocados.senha ? erros.senha : '';

  return (
    <form action={acao} className="flex flex-col gap-6">

      {/* Matrícula */}
      <TextField
        id="matricula"
        name="matricula"
        label="Matrícula"
        placeholder="Digite sua matrícula"
        maxLength={10}
        autoComplete="username"
        required
        isRequired
        isInvalid={Boolean(erroMatricula)}
        errorMessage={erroMatricula}
        leftIcon="PiIdentificationCardBold"
        aria-required="true"
        onBlur={(e) => {
          marcarTocado('matricula');
          validarCampo('matricula', e.target.value);
        }}
      />

      {/* Senha */}
      <TextField
        id="senha"
        name="senha"
        label="Senha"
        placeholder="Digite sua senha"
        type={senhaVisivel ? 'text' : 'password'}
        autoComplete="current-password"
        required
        isRequired
        isInvalid={Boolean(erroSenha)}
        errorMessage={erroSenha}
        leftIcon="PiLockBold"
        rightIcon={senhaVisivel ? 'PiEyeSlashBold' : 'PiEyeBold'}
        aria-required="true"
        onBlur={(e) => {
          marcarTocado('senha');
          validarCampo('senha', e.target.value);
        }}
        classNames={{ inputOuter: 'cursor-pointer' }}
        // Clique no ícone direito alterna visibilidade
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-right-icon]')) setSenhaVisivel((v) => !v);
        }}
      />

      {/* Erro do servidor */}
      {estado?.erro && (
        <Alert color="error">{estado.erro}</Alert>
      )}

      {/* Botão */}
      <Button
        type="submit"
        color="primary"
        isBlock
        isLoading={pendente}
        className="btn-pill h-12 text-[0.95rem] mt-1"
      >
        {pendente ? 'Entrando…' : 'Entrar'}
      </Button>

      {/* Esqueceu a senha */}
      <Text size="sm" className="text-center" style={{ color: '#94a3b8', marginTop: -8 }}>
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
