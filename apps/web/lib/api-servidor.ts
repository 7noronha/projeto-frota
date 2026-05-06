import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ErroApi';
  }
}

export async function fetchServidor<T>(
  caminho: string,
  init?: RequestInit,
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({})) as { message?: string };
    throw new ErroApi(resposta.status, corpo.message ?? `HTTP ${resposta.status}`);
  }

  return resposta.json() as Promise<T>;
}
