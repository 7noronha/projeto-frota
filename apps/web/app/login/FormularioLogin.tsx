'use client';

import { useActionState } from 'react';
import { acaoLogin } from './actions';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

export function FormularioLogin() {
  const [estado, acao, pendente] = useActionState(acaoLogin, null);

  return (
    <form action={acao} className="flex flex-col gap-6">

      {/* Matrícula */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="matricula" className="text-sm font-semibold" style={{ color: '#374151' }}>
          Matrícula
        </label>
        <div className="login-field flex items-center gap-3">
          <i className="pi pi-id-card flex-shrink-0" style={{ color: '#0066FF', fontSize: '1.1rem' }} />
          <InputText
            id="matricula"
            name="matricula"
            placeholder="Digite sua matrícula"
            maxLength={10}
            autoComplete="username"
            required
            className="flex-1"
          />
        </div>
      </div>

      {/* Senha */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-sm font-semibold" style={{ color: '#374151' }}>
          Senha
        </label>
        <div className="login-field flex items-center gap-3">
          <i className="pi pi-lock flex-shrink-0" style={{ color: '#0066FF', fontSize: '1.1rem' }} />
          <Password
            inputId="senha"
            name="senha"
            placeholder="Digite sua senha"
            toggleMask
            feedback={false}
            autoComplete="current-password"
            required
            className="flex-1"
            inputClassName="w-full"
            pt={{ input: { style: { width: '100%' } } }}
          />
        </div>
      </div>

      {/* Erro */}
      {estado?.erro && (
        <Message
          severity="error"
          text={estado.erro}
          style={{ justifyContent: 'flex-start' }}
        />
      )}

      {/* Botão */}
      <Button
        type="submit"
        label={pendente ? 'Entrando…' : 'Entrar'}
        loading={pendente}
        className="w-full btn-pill"
        style={{ height: 48, fontSize: '0.95rem', marginTop: 4 }}
      />

      {/* Esqueceu a senha */}
      <p className="text-center text-sm" style={{ color: '#94a3b8', marginTop: -8 }}>
        Esqueceu o acesso?{' '}
        <a
          href="#"
          className="font-semibold"
          style={{ color: '#0066FF', textDecoration: 'none' }}
          onClick={(e) => e.preventDefault()}
        >
          Contate o TI
        </a>
      </p>
    </form>
  );
}
