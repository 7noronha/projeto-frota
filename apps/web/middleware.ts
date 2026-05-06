import { NextRequest, NextResponse } from 'next/server';

const ROTAS_PUBLICAS = ['/login'];

export function middleware(request: NextRequest): NextResponse {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const ehRotaPublica = ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota));

  if (!token && !ehRotaPublica) {
    const urlLogin = new URL('/login', request.url);
    urlLogin.searchParams.set('redirecionarPara', pathname);
    return NextResponse.redirect(urlLogin);
  }

  if (token && ehRotaPublica) {
    return NextResponse.redirect(new URL('/veiculos', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
