import { NextRequest, NextResponse } from 'next/server';

const ROTAS_PUBLICAS = ['/login', '/erd'];

export function middleware(request: NextRequest): NextResponse {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const ehRotaPublica = ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));

  if (!token && !ehRotaPublica) {
    const urlLogin = new URL('/login', request.url);
    urlLogin.searchParams.set('redirecionarPara', pathname);
    return NextResponse.redirect(urlLogin);
  }

  // Quando autenticado, /login redireciona pra dashboard.
  // /erd é documentação técnica — fica acessível mesmo logado, sem redirect.
  if (token && ehRotaPublica && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/veiculos', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclui da auth: rotas internas do Next, favicon e arquivos estáticos
  // comuns servidos a partir de /public (imagens, SVGs, fontes). Sem essa
  // exclusão, o middleware redireciona até o asset da tela de login pra
  // /login, criando um loop e a imagem nunca carrega.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|map)$).*)',
  ],
};
