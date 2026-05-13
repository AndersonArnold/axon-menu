import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CONFIGURAÇÃO OBRIGATÓRIA PARA A CLOUDFLARE NESTA VERSÃO
export const config = {
  runtime: 'experimental-edge',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Identifica a lanchonete (ex: lanchonete.axonmenu.com)
  const currentHost = hostname
    .replace(`.localhost:3000`, '')
    .replace(`.axon-menu.pages.dev`, '');

  // Evita loops em ficheiros de sistema e imagens
  if (url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redireciona internamente para a pasta do lojista
  return NextResponse.rewrite(new URL(`/${currentHost}${url.pathname}`, request.url));
}