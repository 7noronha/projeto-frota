import { NextResponse } from 'next/server';
import { fetchServidor, ErroApi } from '@/lib/api-servidor';

interface PosicaoResposta {
  id: number;
  viagem_id: number;
  latitude: number;
  longitude: number;
  precisao_m: number | null;
  capturado_em: string;
}

/**
 * Proxy do GET de posições da viagem.
 *
 * O client component faz polling neste endpoint (que mora no mesmo
 * origin do web) em vez de chamar a API diretamente — assim o token
 * httpOnly fica server-side e o CORS não precisa ser frouxo.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  const url = new URL(request.url);
  const limite = url.searchParams.get('limite') ?? '1';

  try {
    const posicoes = await fetchServidor<PosicaoResposta[]>(
      `/viagens/${id}/posicoes?limite=${encodeURIComponent(limite)}`,
    );
    return NextResponse.json(posicoes);
  } catch (erro) {
    if (erro instanceof ErroApi) {
      return NextResponse.json({ message: erro.message }, { status: erro.status });
    }
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
