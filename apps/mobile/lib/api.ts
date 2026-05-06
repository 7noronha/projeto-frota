import { buscarToken } from './auth';

// Em Android Emulator, 10.0.2.2 aponta para localhost da máquina host
// Em iOS Simulator, usar localhost diretamente
// Em dispositivo físico, usar o IP da máquina na rede local
const URL_API = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3001';

export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ErroApi';
  }
}

export async function fetchApi<T>(caminho: string, init?: RequestInit): Promise<T> {
  const token = await buscarToken();

  const resposta = await fetch(`${URL_API}${caminho}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const dados = (await resposta.json()) as unknown;

  if (!resposta.ok) {
    const mensagem =
      typeof dados === 'object' && dados !== null && 'message' in dados
        ? String((dados as { message: unknown }).message)
        : 'Erro na requisição';
    throw new ErroApi(resposta.status, mensagem);
  }

  return dados as T;
}
