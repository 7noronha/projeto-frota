'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface RespostaLogin {
  token: string;
  usuario: { id: string; matricula: string; nome: string; perfil: string };
}

interface ErroFormulario {
  erro: string;
}

export async function acaoLogin(
  _estadoAnterior: ErroFormulario | null,
  formData: FormData,
): Promise<ErroFormulario | null> {
  const matricula = formData.get('matricula') as string;
  const senha = formData.get('senha') as string;

  if (!matricula || !senha) {
    return { erro: 'Preencha todos os campos' };
  }

  const apiUrl = process.env.API_URL ?? 'http://localhost:3001';

  let resposta: Response;
  try {
    resposta = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricula, senha }),
    });
  } catch {
    return { erro: 'Não foi possível conectar ao servidor. Tente novamente.' };
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({})) as { message?: string };
    return { erro: corpo.message ?? 'Matrícula ou senha incorretos' };
  }

  const dados = (await resposta.json()) as RespostaLogin;

  const cookieStore = await cookies();
  cookieStore.set('token', dados.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  redirect('/dashboard');
}
