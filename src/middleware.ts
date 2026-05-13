import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CORREÇÃO DO ERRO: Alterado para 'experimental-edge' conforme log de build
export const config = {
  runtime: 'experimental-edge',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Lógica de subdomínio para o Axon Menu
  const currentHost = hostname
    .replace(`.localhost:3000`, '')
    .replace(`.axon-menu.pages.dev`, '');

  // Evita loops em arquivos do sistema (importante para não travar o build)
  if (url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redireciona internamente para a rota do lojista
  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}`, request.url));
}