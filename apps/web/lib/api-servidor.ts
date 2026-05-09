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

  const temBody = init?.body !== undefined && init.body !== null;

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...init,
      headers: {
        ...(temBody ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      cache: 'no-store',
    });
  } catch {
    throw new ErroApi(503, 'Serviço temporariamente indisponível. Tente novamente em instantes.');
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({})) as { message?: string | string[] };
    const mensagem = Array.isArray(corpo.message)
      ? corpo.message[0]
      : (corpo.message ?? `Erro ${resposta.status}`);
    throw new ErroApi(resposta.status, mensagem);
  }

  if (resposta.status === 204 || resposta.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return resposta.json() as Promise<T>;
}
